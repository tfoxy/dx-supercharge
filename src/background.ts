import { registerNotificationListeners } from "./domains/notificationManager/background";
import { registerOptionsListener } from "./domains/optionsManager/background";
import { registerJenkinsListeners } from "./domains/jenkins/background";
import { registerGithubListeners } from "./domains/github/background";

registerNotificationListeners();
registerOptionsListener();
registerJenkinsListeners();
registerGithubListeners();
