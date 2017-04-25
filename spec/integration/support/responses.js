module.exports = {
  apiBooks: [
    {
      id: 1,
      title: 'Lorem ipsum dolor sit amet',
      description: 'consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
    },
    {
      id: 2,
      title: 'Ut enim ad minim veniam',
      description: 'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'
    }
  ],

  apiBooksById: {
    id: 1,
    title: 'Lorem ipsum dolor sit amet',
    description: 'consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    extra: true
  },

  apiPlainText: 'API-Plain-Text',

  apiPicturesCreate: {
    picture_id: 3
  },

  apiPicturesAdd: {
    picture_id: 3,
    new: true
  },

  apiPicturesUpload: {
    created: true
  },

  apiFailure: {
    errorMessage: 'something went bad'
  },

  apiFailOnOdd: {
    payload: 'data'
  },

  apiSecure: {
    ok: true
  },

  apiTimeout: {
    ok: true
  }
}
