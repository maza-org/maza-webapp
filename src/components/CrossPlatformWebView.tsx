/**
 * CrossPlatformWebView
 * - On native (iOS/Android): uses react-native-webview
 * - On web: renders HTML via blob-URL iframe, or for video/audio/pdf renders native HTML elements
 */
import React from 'react';
import { Platform, View, StyleSheet, Text } from 'react-native';

type Source =
  | { uri: string; html?: never }
  | { html: string; uri?: never };

interface Props {
  source: Source;
  style?: any;
  allowsFullscreenVideo?: boolean;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  startInLoadingState?: boolean;
  renderLoading?: () => React.ReactElement;
  showsVerticalScrollIndicator?: boolean;
  onMessage?: (event: any) => void;
  onLoadEnd?: () => void;
  injectedJavaScript?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
  /** For native only — WebView ref */
  webViewRef?: React.Ref<any>;
}

// ─── Web implementation ────────────────────────────────────
function WebImpl({ source, style, onMessage, onLoadEnd, injectedJavaScript, injectedJavaScriptBeforeContentLoaded }: Props) {
  const flatStyle = StyleSheet.flatten(style) ?? {};
  const messageIdRef = React.useRef(`cpwv-${Math.random().toString(36).slice(2)}`);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const htmlSource = 'html' in source ? source.html : null;
  const isVideoHtml = !!htmlSource?.includes('<video');
  const isAudioHtml = !!htmlSource?.includes('<audio');
  const isPdfHtml = !!htmlSource && (htmlSource.includes('pdfjsLib') || htmlSource.includes('pdf.min.js'));
  const bridgeScript = htmlSource && (injectedJavaScript || injectedJavaScriptBeforeContentLoaded)
    ? `<script>(function(){window.ReactNativeWebView={postMessage:function(data){window.parent.postMessage({__crossPlatformWebViewId:'${messageIdRef.current}',data:data},'*');}};})();</script><script>${injectedJavaScriptBeforeContentLoaded ?? ''}</script><script>${injectedJavaScript ?? ''}</script>`
    : '';
  const bridgedHtml = htmlSource && bridgeScript
    ? /<\/body>/i.test(htmlSource)
      ? htmlSource.replace(/<\/body>/i, `${bridgeScript}</body>`)
      : `${htmlSource}${bridgeScript}`
    : htmlSource;
  const blobUrl = React.useMemo(() => {
    if (!bridgedHtml || isVideoHtml || isAudioHtml || isPdfHtml) return null;
    return URL.createObjectURL(new Blob([bridgedHtml], { type: 'text/html;charset=utf-8' }));
  }, [bridgedHtml, isVideoHtml, isAudioHtml, isPdfHtml]);
  const height =
    typeof flatStyle.height === 'number'
      ? flatStyle.height
      : typeof flatStyle.minHeight === 'number'
      ? flatStyle.minHeight
      : undefined;

  React.useEffect(() => {
    if (!onMessage) return;
    const listener = (event: any) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event?.data?.__mazaLesson) {
        onMessage({ nativeEvent: { data: JSON.stringify({ type: event.data.type }) } });
        return;
      }
      if (event?.data?.__crossPlatformWebViewId !== messageIdRef.current) return;
      onMessage({ nativeEvent: { data: event.data.data } });
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onMessage]);

  if (htmlSource) {
    // Detect video HTML — render <video> directly instead of iframe to avoid download interception
    if (isVideoHtml) {
      // Extract src from <source src="...">
      const srcMatch = htmlSource.match(/<source src="([^"]+)"/);
      const src = srcMatch?.[1];
      if (src) {
        return (
          <View style={[{ backgroundColor: '#000', justifyContent: 'center' }, style]}>
            {/* @ts-ignore */}
            <video
              controls
              autoPlay
              preload="auto"
              playsInline
              style={{ width: '100%', height: height ?? '100%', outline: 'none', display: 'block' }}
              src={src}
              onLoadedMetadata={(event: any) => {
                onMessage?.({ nativeEvent: { data: JSON.stringify({ type: 'media-duration', duration: event.currentTarget.duration || 0 }) } });
              }}
              onTimeUpdate={(event: any) => {
                onMessage?.({ nativeEvent: { data: JSON.stringify({ type: 'media-time', currentTime: event.currentTarget.currentTime || 0, duration: event.currentTarget.duration || 0 }) } });
              }}
            />
          </View>
        );
      }
    }

    // Detect audio HTML — render <audio> directly
    if (isAudioHtml) {
      const srcMatch = htmlSource.match(/<source src="([^"]+)"/);
      const src = srcMatch?.[1];
      if (src) {
        return (
          <View style={[{ padding: 24, alignItems: 'center', justifyContent: 'center' }, style]}>
            {/* @ts-ignore */}
            <audio
              controls
              autoPlay
              preload="auto"
              style={{ width: '100%', height: height ?? '100%', maxWidth: 480 }}
              src={src}
              onLoadedMetadata={(event: any) => {
                onMessage?.({ nativeEvent: { data: JSON.stringify({ type: 'media-duration', duration: event.currentTarget.duration || 0 }) } });
              }}
              onTimeUpdate={(event: any) => {
                onMessage?.({ nativeEvent: { data: JSON.stringify({ type: 'media-time', currentTime: event.currentTarget.currentTime || 0, duration: event.currentTarget.duration || 0 }) } });
              }}
            />
          </View>
        );
      }
    }

    // Detect PDF viewer HTML — extract PDF URL and render via iframe (more reliable than embed)
    if (isPdfHtml) {
      // Extract the PDF URL from the getDocument call
      const pdfMatch = htmlSource.match(/pdfjsLib\.getDocument\('([^']+)'\)/);
      const pdfUrl = pdfMatch?.[1];
      if (pdfUrl) {
        return (
          <View style={[{ flex: 1 }, style]}>
            {/* @ts-ignore */}
            <iframe
              src={`${pdfUrl}#toolbar=1&view=FitH`}
              style={{ width: '100%', height: height ?? '100%', minHeight: 500, border: 'none' }}
              title="PDF Viewer"
            />
          </View>
        );
      }
    }

    // Generic HTML — use blob URL iframe
    if (!blobUrl) {
      return <View style={[{ flex: 1 }, style]} />;
    }
    return (
      <View style={[{ flex: 1 }, style]}>
        {/* @ts-ignore — iframe is valid on web via react-native-web */}
        <iframe
          ref={iframeRef}
          src={blobUrl}
          style={{
            width: '100%',
            height: height ?? '100%',
            flex: 1,
            border: 'none',
            minHeight: flatStyle.minHeight ?? 400,
            touchAction: 'manipulation',
          }}
          sandbox="allow-scripts allow-forms allow-pointer-lock"
          allow="autoplay; fullscreen"
          onLoad={onLoadEnd}
        />
      </View>
    );
  }

  if (source.uri) {
    return (
      <View style={[{ flex: 1 }, style]}>
        {/* @ts-ignore */}
        <iframe
          ref={iframeRef}
          src={source.uri}
          style={{
            width: '100%',
            height: height ?? '100%',
            flex: 1,
            border: 'none',
            minHeight: flatStyle.minHeight ?? 400,
          }}
          allow="autoplay; fullscreen; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads"
          allowFullScreen
          onLoad={onLoadEnd}
        />
      </View>
    );
  }

  return <Text style={{ color: 'red' }}>Sem conteúdo para mostrar</Text>;
}

// ─── Native implementation ─────────────────────────────────
let NativeWebView: any = null;
if (Platform.OS !== 'web') {
  // Dynamic require so web bundler doesn't try to bundle react-native-webview
  NativeWebView = require('react-native-webview').WebView;
}

function NativeImpl({ source, style, allowsFullscreenVideo, javaScriptEnabled, domStorageEnabled, startInLoadingState, renderLoading, showsVerticalScrollIndicator, webViewRef, onMessage, onLoadEnd, injectedJavaScript, injectedJavaScriptBeforeContentLoaded }: Props) {
  if (!NativeWebView) {
    return <Text style={{ color: 'red' }}>WebView não disponível</Text>;
  }
  return (
    <NativeWebView
      ref={webViewRef}
      source={source}
      style={[{ flex: 1 }, style]}
      originWhitelist={['about:blank', 'data:*', 'file://*', 'http://localhost:*', 'http://127.0.0.1:*', 'https://*.mazas.org', 'https://*.digitaloceanspaces.com', 'https://*.r2.dev', 'https://*.youtube.com', 'https://*.youtube-nocookie.com']}
      allowsFullscreenVideo={allowsFullscreenVideo}
      javaScriptEnabled={javaScriptEnabled ?? true}
      domStorageEnabled={domStorageEnabled ?? true}
      cacheEnabled
      allowFileAccess
      allowFileAccessFromFileURLs
      allowUniversalAccessFromFileURLs={false}
      mixedContentMode="never"
      androidLayerType="hardware"
      allowsInlineMediaPlayback={true}
      allowsAirPlayForMediaPlayback={true}
      ignoreSilentHardwareSwitch={true}
      mediaPlaybackRequiresUserAction={false}
      startInLoadingState={startInLoadingState}
      renderLoading={renderLoading}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onMessage={onMessage}
      onLoadEnd={onLoadEnd}
      injectedJavaScript={injectedJavaScript}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
      javaScriptCanOpenWindowsAutomatically={false}
      setSupportMultipleWindows={false}
    />
  );
}

// ─── Exported component ────────────────────────────────────
export default function CrossPlatformWebView(props: Props) {
  if (Platform.OS === 'web') {
    return <WebImpl {...props} />;
  }
  return <NativeImpl {...props} />;
}
