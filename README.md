# aem-component-scaffolding

Node module for scaffolding AEM Components (Note: not ready for production use)

Getting started:
1. Copy example/gulpfile.js into your root directory.
2. Customize the config object with your project directory name.
3. Run gulp watch to monitor the file system
4. Run gulp create-component --type content --name MyComponentName
5. The watch command will observe the new component has been added to your filesystem and automatically import it into CRX.

Example folder
- minimum package.json
- gulpfile.js file contains config and helper methods to add scaffolding components to your project



@TODO
- Add tests
- Add support for structure and navigation components
