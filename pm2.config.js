module.exports = {
  apps: [
    {
      name: 'wormhole-chat',
      script: 'server/index.mjs',
      instances: '1',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
