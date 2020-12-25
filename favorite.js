// 初始變數
const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USERS_PER_PAGE = 6

// 存放資料的容器
const users = JSON.parse(localStorage.getItem('love'));
let searchResult = [];
let filteredResult = [];
let thePage = 1;

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const viewMode = document.querySelector('#view-mode')
const themeChoice = document.querySelector('#themeChoice')

// Login區塊
// 1.1 主題選擇 --> 預設為pink主題
themeChoice.addEventListener('click', function onClickedTheme(e) {
  const head = document.querySelector('head')

  // 點擊warm主題，則新增css樣式表
  if (e.target.matches('.warm')) {
    const newTheme = document.createElement('link')
    newTheme.rel = 'stylesheet'
    newTheme.href = './themes/theme2.css'
    head.append(newTheme)
  }

  // 點擊pink，若樣式為pink，則返回；否則移除最後一個元素，即warm樣式表
  else if (e.target.matches('.pink')) {

    if (head.lastElementChild.href = './themes/theme1.css') return
    else {
      head.removeChild(head.lastElementChild)
    }
  }

})

// 加入分頁功能，每頁3個名單
// 1.3 設置監聽器，當點擊分頁碼時，找出資料切割的區段
// 1.4 將回傳的該區段資料渲染在畫面上
paginator.addEventListener('click', function onPaginatorClicked(event) {
  thePage = event.target.dataset.page
  displayUsers(getUsersByPage(thePage))
})

// 函式 - 找出資料切割的區段，並回傳該區段，若搜尋欄有東西，已搜尋結果分頁
function getUsersByPage(page) {
  // page 1 --> get 0-11 
  // page 2 --> get 12-23
  const startIndex = (page - 1) * USERS_PER_PAGE
  const usersThisPage = users.slice(startIndex, startIndex + USERS_PER_PAGE)
  return usersThisPage
}

// 函式 - 渲染分頁器頁碼
// 1.1 資料總數 / 每頁數目 計算分頁數
// 1.2 依照分頁數目渲染畫面的分頁器
function displayPaginator(data) {

  // 計算總頁數
  const numberOfPages = Math.ceil(data.length / USERS_PER_PAGE)

  let htmlContent = ``

  for (let i = 0; i < numberOfPages; i++) {
    htmlContent += `
      <li class="page-item"><a class="page-link" href="#" data-page='${i + 1}'>${i + 1}</a></li>
    `
  }
  paginator.innerHTML = htmlContent;

}

// 切換渲染顯示
// 1.1 綁定監聽器，點選時切換
// 1.2 任何動作渲染畫面前切換
viewMode.addEventListener('click', function onClickedViewMode(event) {
  // const data = filteredResult.length ? filteredResult : users
  displayUsers(getUsersByPage(thePage))
  displayPaginator(users)
})

// 函式 - 將所有使用者的資料渲染畫面
function displayUsers(data) {
  let htmlContent = ``

  // 取得顯示模式
  const selectedMode = document.querySelector('input[name=view]:checked').value

  if (selectedMode === 'gallery') {
    // 依序讀取users資料，用gallery模式顯示
    data.forEach((item) => {
      htmlContent += `
    <div class="col-sm-6 col-md-4 col-lg-3 my-3"">
        <div class="user-card">
          <div class="img-container ${item.gender}">
            <img src="${item.avatar}" class="card-img modal-trigger" data-id='${item.id}'
              data-toggle="modal" data-target="#user-modal" alt="user-img">
            <button type="button" class="btn-remove-love" data-id='${item.id}'>
              <i class="fas fa-trash-alt btn-remove-love" data-id='${item.id}'></i>
            </button>
          </div>
          <div class="card-title">${item.name}</div>
        </div>
      </div>
    `;
      // console.log(item);
    })
  }

  else if (selectedMode === 'list') {
    // 依序讀取users資料，用List模式顯示
    data.forEach((item) => {
      htmlContent += `
      <div class="col-12 my-1">
        <div class="user-card-list">
          <div class="info-container">
            <span class='${item.gender}'></span>
            <div class="card-title">${item.name} ${item.surname}</div>
          </div>
          <div class="btn-container">
            <button class="modal-trigger" data-id='${item.id}' data-toggle="modal"
              data-target="#user-modal">More</button>
            <button type="button" class="btn-remove-love" data-id='${item.id}'>
              <i class="fas fa-trash-alt btn-remove-love" data-id='${item.id}'></i>
            </button>
          </div>
        </div>
      </div>
    `;
      // console.log(item);
    })
  }

  dataPanel.innerHTML = htmlContent;
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
  if (event.target.matches(".modal-trigger")) {
    //如果點擊的是modal-trigger
    showUserModal(Number(event.target.dataset.id)); //取得圖像id並且執行showUserModal
  } else if (event.target.matches('.btn-remove-love')) { //點擊垃圾桶
    removeFromLove(Number(event.target.dataset.id)) //執行removeFromLove
  }
});

// TODO: 收藏頁面新增的內容

// 刪除使用者資料
// 1.1 改變 users 容器內的資料，重新渲染頁面及分頁器
// 1.2 依照頁面內容停留在使用者所在頁面或跳轉成至前一頁

function removeFromLove(id) {

  // 先取得id的Index所屬區段的那一頁
  const page = findDeleteItemPage(id)

  // 才進行users內容更動，找出id的Index並刪除
  const theUserIndex = users.findIndex((user) => user.id === id)
  users.splice(theUserIndex, 1)
  localStorage.setItem('love', JSON.stringify(users))

  // 用getUsersByPage切出該頁的index區段
  // 若該區段有內容，則停留在該頁(true)；若區段內沒有內容(即長度為0)，則頁數往前一頁(減一)(false)
  const thePage = getUsersByPage(page).length ? page : (page - 1)

  if (thePage === 0) {  //如果第一頁也沒有內容了(即頁數1再減一為0)
    displayUsers(getUsersByPage(1)) //則停留在第一頁，分頁器無須重新渲染(頁碼為1)
  } else {
    displayPaginator(users) //依照users長度重新渲染分頁器
    displayUsers(getUsersByPage(thePage)) //停留在thePage那一頁
  }

}

// 函式 - 找出欲刪除項目的所在頁面
function findDeleteItemPage(id) {
  const numberOfPages = Math.ceil(users.length / USERS_PER_PAGE) //總頁數 2
  for (let page = 1; page <= numberOfPages; page++) {
    const usersRange = getUsersByPage(page) //getUsersByPage(1)
    // page 1 --> usersRange = users [0,1,2,3,4,5]
    // page 2 --> usersRange = users [6,7,8,9,10,11]
    if (usersRange.some((user) => user.id === id)) { //找到id的那一頁
      // console.log(usersRange, page, id)
      return (page)
    }
  }
}

// 在收藏頁面取得localStorage資料並渲染畫面
// 直接修改前面user指向的內容為localStorage，再display一次
displayPaginator(users)
displayUsers(getUsersByPage(1))
