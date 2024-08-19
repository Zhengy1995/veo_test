import { PropsWithChildren } from "react";
import style from "./index.module.less";

const Container = ({ children }: PropsWithChildren) => {
  return <div className={style.moduleContainer}>{children}</div>;
};

export default Container;
