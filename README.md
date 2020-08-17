# Bento Web

![Build Status](https://api.travis-ci.org/c3g/chord_web.svg?branch=master)

Front end for a single Bento platform node. Written in React using Ant Design 
components.

## Coding Style

  * Use 4 spaces for indentation
  * Use `async`/`await` syntax for asynchronous operations

## Project Structure

  * `.babelrc`: Babel configuration file
  * `.eslintrc.js`: ESLint configuration file
  * `src/`: All application source code
    * `components/`: UI components. 
      * `App.js`: The root component, which determines the overall layout of 
                  the entire application.
      * `...`
    * `modules/`: Redux "modules", which determine the structure of the Redux 
                  state tree and specify relevant actions and reducers to 
                  handle them. This isn't a Redux-defined concept; rather,
                  these can be thought of as an arbitrary but useful way to
                  divide up action and reducer definitions into manageable,
                  semi-self-contained sections.
    * `styles/`: Shared style objects.
    * `utils/`: Utility code shared across components, state code, and other 
                modules in the application.
      * `actions.js`: Utilities related to Redux actions
      * `menu.js`: Utilities related to Ant Design menus
      * `misc.js`: Miscellaneous helper functions
      * `notifications.js`: Utilities related to CHORD notifications
      * `requests.js`: Utilities related to HTTP requests
      * `schema.js`: Utilities related to JSON schemas
      * `search.js`: Utilities related to CHORD search
      * `url.js`: Utilities related to handling front-end URLs
    * `constants.js`: Re-usable application constants
    * `duo.js`: Constants and objects related to the CHORD representation of
                the GA4GH Data Use Ontology.
    * `events.js`: Event dispatching code for triggering event handlers defined
                   elsewhere.
    * `index.js`: The entry point for the application. Sets up the store and
                  router and renders the `App` component.
    * `propTypes.js`: Re-usable prop types defined using the `prop-types`
                      module to enforce component property types.
    * `reducers.js`: Root reducer definition
    * `template.html`: HTML template for the application (given to `webpack`)
  * `public/LICENSE.txt`: Copy of the LGPL v3.0 license for serving from
                          deployed instances of the application.
  * `webpack.config.js`: Webpack configuration file
