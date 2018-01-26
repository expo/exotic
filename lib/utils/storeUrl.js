import { Constants } from 'expo';
import { Platform } from 'react-native';

function storeUrl() {
  const { OS } = Platform;
  const manifest = Constants.manifest[OS];

  if (OS === 'ios') {
    return manifest.appStoreUrl;
  } else {
    if (manifest.playStoreUrl) {
      return manifest.playStoreUrl;
    } else if (manifest.package) {
      return `https://play.google.com/store/apps/details?id=${
        manifest.package
      }`;
    }
  }
}

export default storeUrl;
