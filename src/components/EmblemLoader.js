import React from 'react';
import Globals from './Globals';
import cx from 'classnames'
import ObservedImage from './ObservedImage';




class EmblemLoader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    }
  }

  componentDidMount () {

    let emblemHash = this.props.hash
    
    fetch(
      `https://api.braytech.org/?request=manifest&table=DestinyInventoryItemDefinition&hash=${ emblemHash }`,
      {
        headers: {
          "X-API-Key": Globals.key.braytech,
        }
      }
    )
    .then(response => {
      return response.json();
    })
      .then(response => {
  
        this.setState({
          Item: response.response.data.items[0]
        });

        console.log(this.state)

      })
    .catch(error => {
      console.log(error);
    })

  }

  render() {

    if (this.state.Item) {
      return (
        <ObservedImage className={cx(
              "image",
              "emblem",
              "backgroundImage",
              {
                "missing": this.state.Item.redacted
              }
            )}
          src={ `https://www.bungie.net${ this.state.Item.secondarySpecial ? this.state.Item.secondarySpecial : `/img/misc/missing_icon_d2.png` }` } />
      )
    }
    else {
      return null
    }

  }
}

export default EmblemLoader;