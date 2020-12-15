// 初始變數
const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"
const USERS_PER_PAGE = 6

// 存放資料的容器
let users = JSON.parse(localStorage.getItem('love'))
let filteredUserByName = []

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


// 函式 - 將所有使用者的資料渲染畫面
function displayUsers(data) {
  let htmlContent = ``;
  // 依序讀取users資料
  data.forEach((item) => {
    htmlContent += `
    <div class="col-sm-2 mb-3">
      <div class="card">
        <img src="${item.avatar}" class="card-img-top" data-id='${item.id}' data-toggle="modal" data-target="#user-modal" alt="...">
        <div class="card-body">
          <div class="row">
            <div class="col-8">
              <h5 class="card-title">${item.name}</h5>
            </div>
            <div class="col-4">
              <button type="button" class="btn btn-danger btn-sm btn-remove-love" data-id='${item.id}'><i class="fas fa-trash-alt btn-remove-love" data-id='${item.id}'></i></button>
            </div>
           </div>
        </div>
      </div>
    </div>
    `;
    // console.log(item);
  });

  dataPanel.innerHTML = htmlContent;
}

// 刪除使用者資料 --> 記得將 users 修改成 let 變數不是const
function removeFromLove(id) {
  const theUserIndex = users.findIndex((user) => user.id === id)
  users.splice(theUserIndex, 1)
  localStorage.setItem('love', JSON.stringify(users))
  // numberOfPages = Math.ceil(users.length / USERS_PER_PAGE)

  displayPaginator(users) //依照users長度重新渲染分頁器
  displayUsers(getUsersByPage(1)) //總頁數的最後一頁

  // //如果新的頁數減少，則往前一頁(= 顯示新的總頁數的最後一頁 )
  // if (newNumberOfPages < numberOfPages) {
  //   displayUsers(getUsersByPage(newNumberOfPages))
  // }

}
// TODO: 刪除後分頁器要隨之改變

// 收藏也要分頁
// 加入分頁功能，每頁6個名單
// 1.3 設置監聽器，當點擊分頁碼時，找出資料切割的區段
// 1.4 將回傳的該區段資料渲染在畫面上
paginator.addEventListener('click', function onPaginatorClicked(event) {
  const thePage = event.target.dataset.page
  displayUsers(getUsersByPage(thePage))
})

// 函式 - 找出資料切割的區段，並回傳該區段
function getUsersByPage(page) {
  // page 1 --> get 0-5
  // page 2 --> get 6-11
  const startIndex = (page - 1) * USERS_PER_PAGE
  const usersThisPage = users.slice(startIndex, startIndex + USERS_PER_PAGE)
  return usersThisPage
}

// 函式 - 渲染分頁器頁碼
// 1.1 資料總數 / 每頁數目 計算分頁數
// 1.2 依照分頁數目渲染畫面的分頁器
function displayPaginator(data) {

  // 計算總頁數
  let numberOfPages = Math.ceil(users.length / USERS_PER_PAGE)

  let htmlContent = ``

  for (let i = 0; i < numberOfPages; i++) {
    htmlContent += `
      <li class="page-item"><a class="page-link" href="#" data-page='${i + 1}'>${i + 1}</a></li>
    `
  }
  paginator.innerHTML = htmlContent;

}

// 函式 - 顯示個人modal內容
function showUserModal(id) {
  const userName = document.querySelector("#user-modal-title");
  const userImg = document.querySelector("#user-modal-image");
  const userInfoList = document.querySelector("#user-modal-info");

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      userName.innerText = response.data.name;
      userImg.innerHTML = `
      <img src="${response.data.avatar}" alt="user-avatar" class='img-fluid rounded-circle'>`;
      userInfoList.innerHTML = `
        <li>Birthday：${response.data.birthday}</li>
        <li>Gender：${response.data.gender}</li>
        <li>Region：${response.data.region}</li>
        <li>Email：${response.data.email}</li>
      `;
      // console.log(response.data);
    })
    .catch((err) => console.log(err));
}


// dataPanel監聽器，點擊圖像時取得使用者id的API資料
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".card-img-top")) {
    //如果點擊的是圖像
    showUserModal(Number(event.target.dataset.id)); //取得圖像id並且執行showUserModal
  } else if (event.target.matches('.btn-remove-love')) { //點擊垃圾桶
    removeFromLove(Number(event.target.dataset.id)) //執行removeFromLove
  }
});

// 在收藏頁面取得localStorage資料並渲染畫面
// 直接修改前面user指向的內容為localStorage，再display一次
displayPaginator(users)
displayUsers(getUsersByPage(1))