/**
 * UrlController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


const random = require('random-number-csprng');
const bases = require('bases');

module.exports = {


  /**
   * Shorten an url.
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  shorten: async function (req, res) {

    const url = req.param('url', '');

    const valid_url = await sails.helpers.validateUrl(url);

    if( !valid_url ){
      return res.badRequest({
        status: 'error',
        message: 'Invalid or missing parameter: url',
      });
    }


    // If url exists in data-store, then return directly
    const url_exists = await Url.find({url: url}).limit(1);
    // console.log('here - 1');
    if( url_exists.length ){

      const item = url_exists[0];
      const code = bases.toBase(item.id, 58);
      // console.log('here - 2');
      return res.send({
        status: 'success',
        qurl: 'http://localhost:1337/' + code,
        url: item.url,
      });
    }

    // console.log('here - 3');

    let num, code;
    let maxTry = 10;

    do {

      num = Math.abs( await random(0, Number.MAX_SAFE_INTEGER) );
      code = bases.toBase(num, 58);

      const num_exists = await Url.find({id: num}).limit(1);

      // Found a new random id.
      if(num_exists.length === 0){
        break;
      }

    }while(--maxTry <= 0);



    // If failed to create an unique number,
    // after maxTry, it should stop.
    if( maxTry <= 0 ){
      return res.serverError({
        status: 'error',
        message: 'Try Again',
      });
    }


    // Store the url & the number to data-store.
    const data = await Url.create({
      id: num,
      url: url,
    }).fetch();


    // On success, return the result.
    return res.send({
      status: 'success',
      qurl: 'http://localhost:1337/' + code,
      url: data.url,
    });

  },


  /**
   * Redirects to original url.
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  expand: async function (req, res) {

    const code = req.param('code', '');
    const num = bases.fromBase(code, 58);

    // return res.send(code + ' : ' + num);

    const data = await Url.find({ id: num }).limit(1);
    if( data.length === 0 ){
      return res.notFound({
        status: 'error',
      });
    }

    const item = data.pop();

    return res.redirect(301, item.url);

  },


};

