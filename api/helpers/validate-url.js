const validator = require('validator')

module.exports = {


  friendlyName: 'Validate URL',


  description: '',


  inputs: {
    url: {
      type: 'string',
      example: 'http://example.com/path/',
      description: 'The URL to validate.',
      required: true,
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    return validator.isURL(inputs.url);
  }


};

