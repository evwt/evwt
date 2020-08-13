import EvIcon from '@/../plugins/EvIcon';

let localVue = createLocalVue();

let requireContext = require.context('./fixtures/icons', true, /\.svg$/);
EvIcon.build(localVue, requireContext);
