'use strict';

const path = require('path');

const pluginConfigs = require('./ext/plugin')
// add you build-in plugin here, example:
exports.nunjucks = {
    enable: true,
    package: 'egg-view-nunjucks',
};


exports.mongoose = {
    enable: true,
    package: 'egg-mongoose',
};

exports.session = true;

exports.redis = {
    enable: false,
    package: 'egg-redis',
};

exports.doraBackUpData = {
    enable: true,
    package: 'egg-dora-backupdata',
    
};

exports.validate = {
    enable: true,
    package: 'egg-dora-validate',
    
};

exports.doraUploadFile = {
    enable: true,
    package: 'egg-dora-uploadfile',
    
};





// PLUGIN_NORMALPLUGIN_BEGIN

// doraRegUserPluginBegin
exports.doraRegUser = {
    enable: true,
    package: 'egg-dora-reguser',
    
};
// doraRegUserPluginEnd

// doraAdsPluginBegin
exports.doraAds = {
    enable: true,
    package: 'egg-dora-ads',
    
};
// doraAdsPluginEnd

// doraAnnouncePluginBegin
exports.doraAnnounce = {
    enable: true,
    package: 'egg-dora-announce',
    
};
// doraAnnouncePluginEnd

// doraContentPluginBegin
exports.doraContent = {
    enable: true,
    package: 'egg-dora-content',
    
};
// doraContentPluginEnd

// doraContentCategoryPluginBegin
exports.doraContentCategory = {
    enable: true,
    package: 'egg-dora-contentcategory',
    
};
// doraContentCategoryPluginEnd

// doraContentMessagePluginBegin
exports.doraContentMessage = {
    enable: true,
    package: 'egg-dora-contentmessage',
    
};
// doraContentMessagePluginEnd

// doraContentTagsPluginBegin
exports.doraContentTags = {
    enable: true,
    package: 'egg-dora-contenttags',
    
};
// doraContentTagsPluginEnd

// doraContentTempPluginBegin
exports.doraContentTemp = {
    enable: true,
    package: 'egg-dora-contenttemp',
    
};
// doraContentTempPluginEnd

// doraHelpCenterPluginBegin
exports.doraHelpCenter = {
    enable: true,
    package: 'egg-dora-helpcenter',
    
};
// doraHelpCenterPluginEnd

// doraSiteMessagePluginBegin
exports.doraSiteMessage = {
    enable: true,
    package: 'egg-dora-sitemessage',
    
};
// doraSiteMessagePluginEnd

// doraSystemNotifyPluginBegin
exports.doraSystemNotify = {
    enable: true,
    package: 'egg-dora-systemnotify',
    
};
// doraSystemNotifyPluginEnd

// doraSystemOptionLogPluginBegin
exports.doraSystemOptionLog = {
    enable: true,
    package: 'egg-dora-systemoptionlog',
    
};
// doraSystemOptionLogPluginEnd

// doraTemplateConfigPluginBegin
exports.doraTemplateConfig = {
    enable: true,
    package: 'egg-dora-templateconfig',
    
};
// doraTemplateConfigPluginEnd

// doraVersionManagePluginBegin
exports.doraVersionManage = {
    enable: true,
    package: 'egg-dora-versionmanage',
    
};
// doraVersionManagePluginEnd


// doraMiddleStagePluginBegin
exports.doraMiddleStage = {
    enable: true,
    package: 'egg-dora-middlestage',
    
};
// doraMiddleStagePluginEnd


// doraMailTemplatePluginBegin
exports.doraMailTemplate = {
    enable: true,
    package: 'egg-dora-mailtemplate',
    
};
// doraMailTemplatePluginEnd

// doraMailDeliveryPluginBegin
exports.doraMailDelivery = {
    enable: true,
    package: 'egg-dora-maildelivery',
    
};
// doraMailDeliveryPluginEnd

// PLUGIN_NORMALPLUGIN_END





for (const pluginItem in pluginConfigs) {
    if (pluginConfigs.hasOwnProperty(pluginItem)) {
        const element = pluginConfigs[pluginItem];
        exports[pluginItem] = element;
    }
}



// EGGPLUGINCONFIG