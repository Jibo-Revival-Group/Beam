var Jibo = require('../core');
var NodeRSA = require('node-rsa');
var crypto = require('crypto');
var constants = require('constants');
var Storage = require('./storage');
var storage = new Storage();
var CIPHER_NAME = 'aes-256-cbc';
var RSA_KEY_SIZE = 2048;
var SYMM_KEY_SIZE = 32;

Jibo.Key.prototype.storage = storage;

Jibo.Key.prototype.createRsaKeys = function(callback) {
    var key = new NodeRSA({ b: RSA_KEY_SIZE });
    callback(null, {
        PrivateKey: key.exportKey('private'),
        PublicKey: key.exportKey('public')
    });
};

Jibo.Key.prototype.encryptCommonKey = function(params, callback) {
    if (!params.PublicKey) {
        return callback('Public key is required');
    }
    if (!params.Body) {
        return callback('Body is required');
    }
    this.encryptRsa({ Body: params.Body, Key: params.PublicKey }, callback);
};

Jibo.Key.prototype.decryptCommonKey = function(params, callback) {
    if (!params.PrivateKey) {
        return callback('Private key is required');
    }
    if (!params.Body) {
        return callback('Body is required');
    }
    this.decryptRsa({ Body: params.Body, Key: params.PrivateKey }, callback);
};

Jibo.Key.prototype.encryptRsa = function(params, callback) {
    callback(null, crypto.publicEncrypt({
        key: params.Key,
        padding: constants.RSA_PKCS1_PADDING
    }, new Buffer(params.Body, 'base64')));
};

Jibo.Key.prototype.decryptRsa = function(params, callback) {
    callback(null, crypto.privateDecrypt({
        key: params.Key,
        padding: constants.RSA_PKCS1_PADDING
    }, new Buffer(params.Body, 'base64')));
};

Jibo.Key.prototype.getIv = function(key) {
    var positions = [2, 4, 6, 8, 31, 29, 27, 25, 9, 11, 13, 15, 24, 22, 20, 18];
    var iv = new Buffer(positions.length);
    for (var i = 0; i < positions.length; i++) {
        iv[i] = key[positions[i]];
    }
    return iv;
};

Jibo.Key.prototype.encryptSymmetric = function(params, callback) {
    if (!params.Key) {
        return callback('Key is required');
    }
    if (!params.Body) {
        return callback('Body is required');
    }
    var binaryKey = new Buffer(params.Key, 'base64');
    var cipher = crypto.createCipheriv(CIPHER_NAME, binaryKey, this.getIv(binaryKey));
    var crypted = cipher.update(params.Body, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return callback(null, crypted);
};

Jibo.Key.prototype.encryptSymmetricStream = function(params) {
    if (!params.Key) {
        throw new Error('Key is required');
    }
    if (!params.Body) {
        throw new Error('Body is required');
    }
    var binaryKey = new Buffer(params.Key, 'base64');
    var stream = crypto.createCipheriv(CIPHER_NAME, binaryKey, this.getIv(binaryKey));
    return params.Body.pipe(stream);
};

Jibo.Key.prototype.decryptSymmetric = function(params, callback) {
    if (!params.Key) {
        return callback('Key is required');
    }
    if (!params.Body) {
        return callback('Body is required');
    }
    var binaryKey = new Buffer(params.Key, 'base64');
    var decipher = crypto.createDecipheriv(CIPHER_NAME, binaryKey, this.getIv(binaryKey));
    var dec = decipher.update(params.Body, 'hex', 'utf8');
    dec += decipher.final('utf8');
    callback(null, dec);
};

Jibo.Key.prototype.decryptSymmetricStream = function(params) {
    if (!params.Key) {
        throw new Error('Key is required');
    }
    if (!params.Body) {
        throw new Error('Body is required');
    }
    var binaryKey = new Buffer(params.Key, 'base64');
    var stream = crypto.createDecipheriv(CIPHER_NAME, binaryKey, this.getIv(binaryKey));
    return params.Body.pipe(stream);
};

Jibo.Key.prototype.loadOrCreateKeyPair = function(callback) {
    var keyClientContext = this;
    this.storage.load('keypair', function(pairErr, pairResult) {
        if (pairErr) {
            return keyClientContext.createRsaKeys(function(createErr, createResult) {
                if (createErr) {
                    return callback(createErr);
                }
                var jsonResult = JSON.stringify(createResult);
                keyClientContext.storage.save('keypair', jsonResult, function(saveErr) {
                    if (saveErr) {
                        return callback(saveErr);
                    }
                    callback(null, createResult);
                });
            });
        }
        var parsedResult = {};
        try {
            parsedResult = JSON.parse(pairResult);
        } catch (e) {
            return callback('Cannot read previously saved key pair');
        }
        callback(null, parsedResult);
    });
};

Jibo.Key.prototype.addPemHeader = function(key) {
    var cleanKey = this.removePemHeader(key);
    var keyInChunks = key.match(/.{1,64}/g);
    return '-----BEGIN PUBLIC KEY-----\n' + keyInChunks.join('\n') + '\n-----END PUBLIC KEY-----';
};

Jibo.Key.prototype.removePemHeader = function(key) {
    return key.replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '').replace(/\n/g, '');
};

Jibo.Key.prototype.requestSymmetricKey = function(params, callback) {
    if (!params.loopId) {
        return callback('loopId parameter is required');
    }
    var keyClientContext = this;
    this.loadOrCreateKeyPair(function(pairErr, pairResult) {
        if (pairErr) {
            return callback(pairErr);
        }
        keyClientContext.createRequest({
            publicKey: keyClientContext.removePemHeader(pairResult.PublicKey),
            loopId: params.loopId
        }, callback);
    });
};

Jibo.Key.prototype.shareSymmetricKey = function(params, callback) {
    if (!params.loopId) {
        return callback('loopId is required parameter');
    }
    if (!params.id) {
        return callback('id is required parameter');
    }
    var keyClientContext = this;
    this.storage.load('symmetric-' + params.loopId, function(symmErr, symmResult) {
        if (symmErr) {
            return callback(symmErr);
        }
        keyClientContext.getRequest({
            id: params.id
        }, function(getErr, getResult) {
            if (getErr) {
                return callback(getErr);
            }
            // Encrypt and send symmetric key for sharing with requestor
            keyClientContext.encryptCommonKey({
                Body: symmResult,
                PublicKey: keyClientContext.addPemHeader(getResult.publicKey)
            }, function(commonErr, commonResult) {
                if (commonErr) {
                    return callback(commonErr);
                }
                // Now share encrypted key with requestor
                keyClientContext.share({
                    id: params.id,
                    encryptedKey: commonResult.toString('base64')
                }, callback);
            });
        });
    });
};

Jibo.Key.prototype.createSymmetricKey = function(params, callback) {
    if (!params.loopId) {
        return callback('loopId is required parameter');
    }
    var keyClientContext = this;
    this.storage.load('symmetric-' + params.loopId, function(symmErr, symmResult) {
        if (!symmErr && symmResult) {
            return callback('Symmetric key already exists');
        }
        crypto.randomBytes(SYMM_KEY_SIZE, function(err, buffer) {
            if (err) {
                return callback(err);
            }
            var token = buffer.toString('base64');
            keyClientContext.storage.save('symmetric-' + params.loopId, token, function(saveErr) {
                if (saveErr) {
                    return callback(saveErr);
                }
                callback(null, token);
            });
        });
    });
};

Jibo.Key.prototype.loadSymmetricKey = function(params, callback) {
    if (!params.loopId) {
        return callback('loopId is required parameter');
    }
    this.storage.load('symmetric-' + params.loopId, callback);
};

Jibo.Key.prototype.loadOrCreateSymmetricKey = function(params, callback) {
    var keyClientContext = this;
    this.loadSymmetricKey(params, function(loadErr, loadResult) {
        if (!loadErr && loadResult) {
            return callback(null, loadResult);
        }
        keyClientContext.createSymmetricKey(params, callback);
    })
};

Jibo.Key.prototype.saveSymmetricKey = function(params, callback) {
    if (!params.loopId) {
        return callback('loopId is required parameter');
    }
    if (!params.id) {
        return callback('id is required parameter');
    }
    var keyClientContext = this;
    this.getRequest({
        id: params.id
    }, function(getErr, getResult) {
        if (getErr) {
            return callback(getErr);
        }
        // Retrieve own private key
        keyClientContext.loadOrCreateKeyPair(function(pairErr, pairResult) {
            if (pairErr) {
                return callback(pairErr);
            }
            var encryptedKey = new Buffer(getResult.encryptedKey, 'base64');
            keyClientContext.decryptCommonKey({
                Body: encryptedKey,
                PrivateKey: pairResult.PrivateKey
            }, function(decErr, decResult) {
                if (decErr) {
                    return callback(decErr);
                }
                // Save received symmetric key
                // After that you can go on with encription/decryption of all binaries that are in queue
                keyClientContext.storage.save('symmetric-' + params.loopId, decResult.toString('base64'), callback);
            });
        });
    });
};
