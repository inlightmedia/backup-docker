/*
  Inspired by Portainer's implementation found here:
  https://github.com/portainer/portainer/blob/develop/app/docker/helpers/containerHelper.js#L18
*/

const containerInspect2Config = (container) => {
  const config = container.Config;

  // HostConfig
  config.HostConfig = container.HostConfig;

  // Name
  config.name = container.Name.replace(/^\//g, '');

  // Network
  const mode = config.HostConfig.NetworkMode;
  config.NetworkingConfig = {
    EndpointsConfig: {},
  };
  config.NetworkingConfig.EndpointsConfig = container.NetworkSettings.Networks;
  if (mode.indexOf('container:') !== -1) {
    delete config.Hostname;
    delete config.ExposedPorts;
  }

  // Set volumes
  const binds = [];
  const volumes = {};
  container.Mounts.forEach((mount) => {
    const name = mount.Name || mount.Source;
    const containerPath = mount.Destination;
    if (name && containerPath) {
      let bind = `${name}:${containerPath}`;
      volumes[containerPath] = {};
      if (mount.RW === false) {
        bind += ':ro';
      }
      binds.push(bind);
    }
  });

  config.HostConfig.Binds = binds;
  config.Volumes = volumes;
  return config;
};

// Convert volume inspect to a config used for volume creation
const volumeInspect2Config = (inspect) => ({
  Name: inspect.Name,
  Driver: inspect.Driver,
  DriverOpts: inspect.Options,
  Labels: inspect.Labels,
});

module.exports = {
  containerInspect2Config,
  volumeInspect2Config,
};
