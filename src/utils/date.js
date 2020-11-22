import moment from "moment";
import "moment/locale/id";

export const Date = (value) => {
  return {
    history: () => {
      return moment(value).fromNow();
    },
    date: () => {
      return moment(value).format("DD MMM YYYY");
    },
    clock: () => {
      return moment(value).format("HH:mm");
    },
    day: () => {
      return moment(value).format("dddd");
    },
    unix: () => {
      return moment(value).valueOf();
    }
  };
};
