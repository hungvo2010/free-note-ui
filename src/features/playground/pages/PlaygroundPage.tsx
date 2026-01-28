import React from 'react';
import WebSocketPlayground from 'components/playground/WebSocketPlayground';

const PlaygroundPage: React.FC = () => {
  return (
    <div className="playground-page">
      <WebSocketPlayground />
    </div>
  );
};

export default PlaygroundPage;