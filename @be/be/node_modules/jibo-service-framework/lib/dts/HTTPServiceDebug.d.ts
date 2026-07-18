import HTTPService from './HTTPService';
import { ServiceOptions } from './index';
import Router = require('router');
declare class HTTPServiceDebug extends HTTPService {
    constructor(options: ServiceOptions, rootDir: string);
    routes(url: Router): void;
}
export default HTTPServiceDebug;
