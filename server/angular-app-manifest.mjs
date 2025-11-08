
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/pasta-and-pastries/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/pasta-and-pastries"
  },
  {
    "renderMode": 2,
    "route": "/pasta-and-pastries/menu"
  },
  {
    "renderMode": 2,
    "route": "/pasta-and-pastries/about"
  },
  {
    "renderMode": 2,
    "route": "/pasta-and-pastries/contact"
  },
  {
    "renderMode": 2,
    "redirectTo": "/pasta-and-pastries",
    "route": "/pasta-and-pastries/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 11478, hash: '4f06b0b8481d76800565316dd6350552f4cfd17634f55b871b0fc72280ab860f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 8571, hash: 'a74c0e62bf641d7bc8d04a6b3fdeb6b21c4454b32e047ac7dcd37f8f3831d13c', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'about/index.html': {size: 32199, hash: '47e7972a24ff246107a0c31ccc818da63c523c4e741bd29f8124034a43a0d664', text: () => import('./assets-chunks/about_index_html.mjs').then(m => m.default)},
    'menu/index.html': {size: 30829, hash: '5c6ed8973e8a672ebd12797af8d6e551c771e551535cc74e1303dd9082055bdd', text: () => import('./assets-chunks/menu_index_html.mjs').then(m => m.default)},
    'contact/index.html': {size: 39945, hash: '346a5518c499e1707d1a706bed11f894284440857e355888018ff8a6e22b185a', text: () => import('./assets-chunks/contact_index_html.mjs').then(m => m.default)},
    'index.html': {size: 73447, hash: '156ad04d1505a73eaa82543644e8200267d769731bcc283875686ad86e766e19', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-ZAIEFSJG.css': {size: 65052, hash: 'whe4b0fHJ28', text: () => import('./assets-chunks/styles-ZAIEFSJG_css.mjs').then(m => m.default)}
  },
};
