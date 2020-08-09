// import { createLocalVue } from '@vue/test-utils';
import { buildIconLibrary } from '@/../plugins/EvIcon';

let localVue = createLocalVue();

let requireContext = require.context('./fixtures/icons', true, /\.svg$/);
buildIconLibrary(localVue, requireContext);
