"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTO_PATHS = void 0;
exports.getProtoPath = getProtoPath;
const path_1 = require("path");
function getProtoPath(filename) {
    return (0, path_1.join)(__dirname, '../proto', filename);
}
exports.PROTO_PATHS = {
    USER: getProtoPath('user.proto'),
    ORDER: getProtoPath('order.proto'),
    PRODUCT: getProtoPath('product.proto'),
};
//# sourceMappingURL=proto-paths.js.map