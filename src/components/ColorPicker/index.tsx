import { useState, useMemo, CSSProperties } from "react";
import { ColorResult, SketchPicker } from "react-color";
import "./index.less";

const CustomColors = (props: {
  value: string;
  onChange?: (color: string) => void;
}) => {
  const { value, onChange } = props;
  const styles = useMemo<Record<string, CSSProperties>>(() => {
    console.warn("ddd", value);
    return {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        // background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        // background: value,
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
        top: -50,
        right: -261,
        paddingBottom: 60,
      },
      // cover: {
      //   position: 'fixed',
      //   top: '0px',
      //   right: '0px',
      //   bottom: '0px',
      //   left: '0px',
      // },
    };
  }, [value]);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const handleClick = () => {
    // setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (color: ColorResult) => {
    console.warn("dddddddd");
    console.warn(color, color.hex);
    onChange?.(color.hex);
  };
  return (
    <div id="CustomColors">
      <div style={styles.swatch} onClick={handleClick}>
        <div style={styles.color} />
      </div>
      {displayColorPicker ? (
        <div style={styles.popover}>
          <div onClick={handleClose} />
          <SketchPicker color={value} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
};
export default CustomColors;
