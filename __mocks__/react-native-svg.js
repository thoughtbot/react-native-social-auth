const React = require('react');
const { View } = require('react-native');

const Stub = ({ children, ...props }) =>
  React.createElement(View, props, children);

module.exports = Stub;
module.exports.default = Stub;
module.exports.Svg = Stub;
module.exports.Path = Stub;
module.exports.ClipPath = Stub;
module.exports.Rect = Stub;
module.exports.Defs = Stub;
module.exports.G = Stub;
