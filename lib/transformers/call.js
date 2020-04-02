"use strict";

exports.__esModule = true;
exports.default = transformCall;

var _utils = require("../utils");

var _mapPath = _interopRequireDefault(require("../mapPath"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transformCall(nodePath, state) {
  if (state.moduleResolverVisited.has(nodePath)) {
    return;
  }

  const calleePath = nodePath.get('callee');
  const transformFunction = state.normalizedOpts.transformFunctions.find(({
    pattern
  }) => (0, _utils.matchesPattern)(state.types, calleePath, pattern));

  if (transformFunction) {
    state.moduleResolverVisited.add(nodePath);
    const {
      isModulePath
    } = transformFunction;
    (0, _mapPath.default)(nodePath.get('arguments.0'), state, {
      isModulePath
    });
  } else if ((0, _utils.isImportCall)(state.types, nodePath)) {
    state.moduleResolverVisited.add(nodePath);
    (0, _mapPath.default)(nodePath.get('arguments.0'), state, {
      isModulePath: true
    });
  }
}