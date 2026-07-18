var jibo = require('jibo'),
    projectRoot;

module.exports = {
    init(cb){
        jibo.utils.PathUtils.getProjectRoot( function(_projectRoot) {
            projectRoot = _projectRoot;
            cb();
        });
    },

    get(){
        return projectRoot;
    }
}