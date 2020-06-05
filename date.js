exports.getDate=function ()
{
let options = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
};
let today = new Date();
let dayN = today.toLocaleDateString("en-US", options);
return dayN;
}
exports.getDay=function ()
{
let options = {
  weekday: "long",
};
let today = new Date();
let dayN = today.toLocaleDateString("en-US", options);
return dayN;
}
