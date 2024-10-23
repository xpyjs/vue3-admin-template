import hasRole from './hasRole';
import hasPerm from './hasPerm';
import empty from './empty';

export default function directive(app: any) {
  app.directive('role', hasRole);
  app.directive('permission', hasPerm);
  app.directive('empty', empty);
}
