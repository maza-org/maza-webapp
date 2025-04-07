// src/components/WebViewFallback.js
import React from 'react';

export default function WebViewFallback(props) {
  return <iframe src={props.source?.uri} style={props.style} {...props} />;
}
