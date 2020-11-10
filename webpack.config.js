module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 
          {
        	  loader: 'css-loader'
          },
        ]
      },
    ],
  },
};