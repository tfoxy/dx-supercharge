import { registerNotificationListeners } from "./domains/notificationManager/background";
import { registerOptionsListener } from "./domains/optionsManager/background";
import { registerJenkinsListeners } from "./domains/jenkins";
import { registerGithubBackgroundListeners } from "./domains/github";

registerNotificationListeners();
registerOptionsListener();
registerJenkinsListeners();
registerGithubBackgroundListeners();
