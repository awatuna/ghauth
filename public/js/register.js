(function () {
    document.querySelector("#img-captcha").addEventListener("click", refreshCaptcha);
    function refreshCaptcha() {
        document.querySelector("#img-captcha").src = `/api/captcha?t=${new Date().getTime()}`;
    }
    document.querySelector(".btn-register").addEventListener("click", function () {
        var email = document.querySelector("#inputEmail").value;
        var playername = document.querySelector("#inputPlayerName").value;
        var raw_password = document.querySelector("#inputPassword").value;
        var repeat_password = document.querySelector("#inputRepeatPassword").value;
        var captchaCode = document.querySelector("#inputCaptcha").value;
        if (!captchaCode) {
            toastr["error"]("验证码不能为空");
            return;
        }

        if (!email || !raw_password || !playername || !repeat_password) {
            toastr["error"]("邮箱/密码/游戏昵称不能为空");
            return;
        }

        if (raw_password !== repeat_password) {
            toastr["error"]("两次密码输入不一致");
            return;
        }

        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            toastr["error"]("输入的邮箱格式不正确");
            return;
        }

        if (!/^[A-Za-z0-9_]+$/.test(playername) || playername.length < 4 || playername.length > 12) {
            toastr["error"]("输入的游戏昵称不合法");
            return;
        }

        document.querySelector(".btn-register").setAttribute("disabled", "true");
        toastr["info"]("提交中，请稍后...");
        $.post("/api/genkey")
            .success(function (text) {
                if (text.length == 86) {
                    var secret = "";
                    var iv = "";
                    for (var i = 0; i < text.length; i++) {
                        if (i % 2 == 0) {
                            secret += text[i];
                        } else {
                            iv += text[i];
                        }
                    }

                    secret = CryptoJS.enc.Hex.parse(atob(secret + "="));
                    iv = CryptoJS.enc.Hex.parse(atob(iv + "="));
                    var password = raw_password + "dKfkZh";
                    password = CryptoJS.SHA3(password);
                    password = password.toString(CryptoJS.enc.Hex);
                    var data = {
                        email: email,
                        playername: playername,
                        password: password,
                        captcha: captchaCode
                    }
                    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), secret, { iv: iv, padding: CryptoJS.pad.ZeroPadding });
                    postData(encrypted.ciphertext.toString(CryptoJS.enc.Base64));
                } else {
                    throw "传输凭证获取失败";
                }
            })
            .error(function (error) {
                toastr["error"](error.responseText);
                document.querySelector(".btn-register").removeAttribute("disabled");
            });
    })

    function postData(data) {
        $.post("/register", { data: data })
            .success(function (json) {
                switch (json["code"]) {
                    case -1:
                        toastr["error"](json["msg"]);
                        break;
                    case 1000:
                        toastr["success"]("注册成功，2秒后跳转到首页...");
                        setTimeout(function () {
                            location.href = "/"
                        }, 2000);
                        break;
                    default:
                        throw "未知错误";
                }
            })
            .error(function (error) {
                toastr["error"](error.responseText);
            })
            .complete(function () {
                refreshCaptcha();
                document.querySelector(".btn-register").removeAttribute("disabled");
            })
    }
})()