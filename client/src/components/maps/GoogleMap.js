// This component is deprecated - use SimpleMap instead
import SimpleMap from './SimpleMap';

const GoogleMap = (props) => {
  // Convert Google Maps props to SimpleMap props
  const simpleMapProps = {
    ...props,
    center: props.center ? [props.center.lat, props.center.lng] : [24.7136, 46.6753]
  };
  
  return <SimpleMap {...simpleMapProps} />;
};

export default GoogleMap;
