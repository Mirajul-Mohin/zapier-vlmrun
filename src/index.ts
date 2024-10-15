import { version as platformVersion } from 'zapier-platform-core';
import Authentication from './authentication/authentication';
import { AgentAi, DocumentAi, ImageAi, AudioAi, ExperimentalAi, FileOperation } from './creates/description';
const { version } = require('../package.json');

export default {
    version,
    platformVersion,

    authentication: Authentication.config,

    beforeRequest: [...Authentication.befores],

    afterResponse: [...Authentication.afters],

    triggers: {
    },

    creates: {
        [DocumentAi.key]: DocumentAi,
        [ImageAi.key]: ImageAi,
        [AgentAi.key]: AgentAi,
        [AudioAi.key]: AudioAi,
        [ExperimentalAi.key]: ExperimentalAi,
        [FileOperation.key]: FileOperation,
    },
};