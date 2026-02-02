export const getObj = (propType: string) => {
  if (propType == "signup") {
    return {
      name: "",
      email: "",
      password: "",
    };
  }

  return {
    email: "",
    password: "",
  };
};
