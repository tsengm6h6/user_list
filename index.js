// 初始變數
const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USERS_PER_PAGE = 18

// 存放資料的容器
const users = [];
let filteredUserByName = [];

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 加入搜尋功能
// 1.1 按鈕上設置監聽器，Submit時執行onSearchClicked(){
// 1.2 如果搜尋欄沒東西，則return
// 1.3 如果搜尋欄有東西，則進行searchUserBy(name) 
// 1.4 如果搜尋結果為 0，則顯示'查無此人'，用users渲染畫面 }

searchForm.addEventListener('submit', function onSearchClicked(event) {
  event.preventDefault() //停止瀏覽器預設行為
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) return alert('請輸入查詢內容')

  searchUserBy(keyword) //TODO:可改為age、region等
  displayPaginator(filteredUserByName)

  if (filteredUserByName.length === 0) {
    alert('您輸入的內容查無此人')
    displayUsers(users)
  }

})

// 函式 - searchByUser(name) 尋找使用者姓名
// 1.1 取得input內容字串keyword，keyword以name為例
// 1.2 從users裡尋找與字串內容相符的那位人物的那筆資料
// 1.3 用displayUsers()渲染畫面

function searchUserBy(name) {

  // 篩選的function
  function filteruser(user) {
    return user.name.toLowerCase().includes(name) //只保留符合條件者
  }
  // 用filter執行篩選的function並存在filteredUserByName裡
  filteredUserByName = users.filter(filteruser)
  console.log(filteredUserByName)
  displayUsers(getUsersByPage(1)) //渲染畫面為搜尋分頁的第一頁
}

// 加入分頁功能，每頁18個名單
// 1.3 設置監聽器，當點擊分頁碼時，找出資料切割的區段
// 1.4 將回傳的該區段資料渲染在畫面上
paginator.addEventListener('click', function onPaginatorClicked(event) {
  const thePage = event.target.dataset.page
  displayUsers(getUsersByPage(thePage))
})

// 函式 - 找出資料切割的區段，並回傳該區段，若搜尋欄有東西，已搜尋結果分頁
function getUsersByPage(page) {
  // page 1 --> get 0-11 
  // page 2 --> get 12-23
  const data = filteredUserByName.length ? filteredUserByName : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  const usersThisPage = data.slice(startIndex, startIndex + USERS_PER_PAGE)
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
              <button type="button" class="btn btn-info btn-sm btn-add-love" data-id='${item.id}'><i class="fas fa-heart btn-add-love" data-id='${item.id}'></i></button>
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

// 加入收藏功能
// 1.1 設置監聽器在dataPanel，點擊愛心按鈕時取得資料id
// 1.2 用find()找到該筆id資料
// 1.3 存入localStorage中 --> JSON格式轉換
function addToLove(id) {
  const list = JSON.parse(localStorage.getItem('love')) || []
  const theUser = users.find((user) => user.id === id)

  // 若使用者已加入收藏清單，則回傳'已加入清單'
  if (list.some((user) => user.id === id)) {
    return alert('此人已在收藏清單中')
  }

  list.push(theUser)
  localStorage.setItem('love', JSON.stringify(list))
  alert('感謝您的收藏！')
}

// dataPanel監聽器，點擊圖像時取得使用者id的API資料
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".card-img-top")) {
    //如果點擊的是圖像
    showUserModal(Number(event.target.dataset.id)); //取得圖像id並且執行showUserModal
  } else if (event.target.matches('.btn-add-love')) { //點擊愛心
    addToLove(Number(event.target.dataset.id)) //執行addToLove
  }
});

// 串接API取得資料
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results); //展開運算子將資料存進users容器裡
    displayPaginator(users)
    displayUsers(getUsersByPage(1))
  })
  .catch((error) => console.log(error));

