import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubeIframe from 'react-native-youtube-iframe';

const { width, height } = Dimensions.get('window');

interface YoutubePlayerModalProps {
  youtubeId: string;
  onClose: () => void;
}

// Helper function to extract clean YouTube ID from various formats
const extractYoutubeId = (youtubeId: string): string => {
  // Remove common YouTube URL patterns and extract just the ID
  let cleanId = youtubeId;

  // Remove full URLs
  cleanId = cleanId.replace(/^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/, '');
  cleanId = cleanId.replace(/^youtube\.com\/watch\?v=/, '');

  // Remove query parameters and playlist info
  cleanId = cleanId.split('&')[0];
  cleanId = cleanId.split('?')[0];

  return cleanId;
};

const NativeYoutubeIframe = ({ videoId, onVideoEnd }: { videoId: string; onVideoEnd: () => void }) => {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'video-ended') {
        onVideoEnd();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onVideoEnd]);

  const iframeHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <style>
          body { margin: 0; padding: 0; background: #000; }
          #player { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="player"></div>
        <script>
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          let player;
          window.onYouTubeIframeAPIReady = function() {
            player = new window.YT.Player('player', {
              height: '100%',
              width: '100%',
              videoId: '${videoId}',
              playerVars: {
                'autoplay': 1,
                'controls': 1,
                'modestbranding': 1,
                'rel': 0,
                'loop': 0
              },
              events: {
                'onStateChange': onPlayerStateChange
              }
            });
          }

          function onPlayerStateChange(event) {
            if (event.data === window.YT.PlayerState.ENDED) {
              window.parent.postMessage('video-ended', '*');
            }
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.videoContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={onVideoEnd}>
        <Ionicons name="close" size={24} color="#FFF" />
      </TouchableOpacity>
      {Platform.OS === 'web' && (
        <iframe
          src={`data:text/html;charset=utf-8,${encodeURIComponent(iframeHtml)}`}
          style={
            {
              width: '100%',
              height: '100%',
              border: 'none',
            } as React.CSSProperties
          }
          allowFullScreen
        />
      )}
    </View>
  );
};

const YoutubePlayerModal = ({ youtubeId, onClose }: YoutubePlayerModalProps) => {
  const cleanVideoId = extractYoutubeId(youtubeId);

  const onStateChange = (state: string) => {
    if (state === 'ended') {
      onClose();
    }
  };

  if (Platform.OS === 'web') {
    return <NativeYoutubeIframe videoId={cleanVideoId} onVideoEnd={onClose} />;
  }

  return (
    <View style={styles.videoContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#FFF" />
      </TouchableOpacity>
      <YoutubeIframe
        play={true}
        initialPlayerParams={{
          loop: false,
          controls: true,
          modestbranding: true,
          rel: false,
        }}
        width={width}
        height={height}
        videoId={cleanVideoId}
        onChangeState={onStateChange}
        webViewProps={{
          injectedJavaScript: `
            var element = document.getElementsByClassName('container')[0];
            if (element) {
              element.style.position = 'unset';
              element.style.paddingBottom = 'unset';
            }
            true;
          `,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default YoutubePlayerModal;
