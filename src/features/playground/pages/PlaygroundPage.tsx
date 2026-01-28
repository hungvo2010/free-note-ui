import React from 'react';
import WebSocketPlayground from '@features/playground/components/WebSocketPlayground';

const PlaygroundPage: React.FC = () => {
  return (
    <div className="playground-page">
      <WebSocketPlayground />
    </div>
  );
};

export default PlaygroundPage;