
const serverUrl = "https://cp3fbum5pnui.usemoralis.com:2053/server";
const appId = "hxq9qTQo1Og5QLtOk0LxodiEC9WnPuprd8aMw2fe";
Moralis.start({ serverUrl, appId });

/** Add from here down */
async function login() {
  let user = Moralis.User.current();
  if (!user) {
    try {
      user = await Moralis.authenticate({ signingMessage: "Welcome to NFT Game Cards" });
      console.log(user.get("ethAddress"));
      $("#userId").val(user.get("ethAddress"));
      $("#btn-login").hide();
      $("#btn-logout").show();
      Moralis.enableWeb3();
    } catch (error) {
      console.log(error);
    }
  }
}

$(document).ready(function () {
  let user = Moralis.User.current();
  if (user) {
    Moralis.enableWeb3();

    $("#userId").val(user.get("ethAddress"));
    $("#btn-login").hide();
    $("#btn-logout").css("display", "block");
  }
});

async function logOut() {
  await Moralis.User.logOut();
  $("#btn-login").show();
  $("#btn-logout").hide();
  console.log("logged out");
}

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logOut;
