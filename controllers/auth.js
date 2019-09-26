exports.getLogin = (req, res) => {
    const isLoggedIn =
        req
            .get("Cookie")
            .split(";")[2]
            .trim()
            .split("=")[1] === "true";

    res.render("auth/login", {
        docTitle: "Login",
        path: "/login",
        isAuthenticated: isLoggedIn
    });
};
exports.postLogin = (req, res) => {
    res.setHeader("Set-Cookie", "loggedIn=true");
    res.redirect("/");
    // res.render("auth/login", {
    //     docTitle: "Login",
    //     path: "/login"
    // });
};
