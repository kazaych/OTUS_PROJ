var dbPass = "mysql"
var clusterName = "Otus_cluster"

try {
  print('Setting up InnoDB cluster...\n');
  shell.connect('root@srv1', dbPass)
  var cluster = dba.createCluster(clusterName);
  print('Adding instances to the cluster.');
  cluster.addInstance({user: "root", host: "srv2", password: "mysql"}, {recoveryMethod: "clone"})
  print('.');
  cluster.addInstance({user: "root", host: "srv3", password: "mysql"}, {recoveryMethod: "clone"})
  print('.\nInstances successfully added to the cluster.');
  print('\nInnoDB cluster deployed successfully.\n');
} catch(e) {
  print('\nThe InnoDB cluster could not be created.\n\nError: ' + e.message + '\n');
}
