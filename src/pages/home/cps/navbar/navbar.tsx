import * as React from 'react';
import { View } from '@tarojs/components';
import './navbar.scss'
export interface NavbarProps {
  items: Array<{title: string}>,
  selectItem: (id: number) => void
  style: object
}
 
export interface NavbarState {
  index: number
}
 
class Navbar extends React.Component<NavbarProps, NavbarState> {
  constructor(props: NavbarProps) {
    super(props);
    this.state = {
      index: 0
    };
  }
  navItemClick = (id) => {
    const { selectItem } = this.props
    this.setState({index: id})
    selectItem(id)
  }
  render() { 
    const { items, style } = this.props
    const { index } = this.state
    return ( 
      <View className="nav_bar" style={style}>
        {
          items.map(({ title }, i)=>{
            return (
              <View className={index == i ? "nav_item hover_nav" : "nav_item"} 
              onClick={()=>this.navItemClick(i)}>{title}</View>
            )
          })
        }
      </View>
    );
  }
}
 
export default Navbar;