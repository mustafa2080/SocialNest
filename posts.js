// الحصول على عناصر DOM
const posts = document.getElementById("posts");
const userName = document.getElementById("recipient-username");
const passWord = document.getElementById("recipient-password");
const loginModal = document.getElementById("loginModal");
const btnLogout = document.getElementById("btnLogout");
const btnLogin = document.getElementById("loginBtn");

// عناصر مودال التسجيل
const modal_username = document.getElementById("modal-username");
const modal_name = document.getElementById("modal-name");
const modal_email = document.getElementById("modal-email");
const modal_password = document.getElementById("modal-password");
const uploadImageRegister = document.getElementById("uploadImage");
const RegisterModal = document.getElementById("registerModal");
const btnRegisterModal = document.getElementById("btnRegisterModal");
const btnPost = document.getElementById("create-post");
const createNewPostModal = document.getElementById("newPost");

document.addEventListener("DOMContentLoaded", function() {
  setupUI();
  getAllPosts();
});


// متغيرات للصفحات
let currentPage = 1;
let lastPage = 1;

// INFINITE SCROLL
window.addEventListener("scroll", function () {
  const endOfPage = window.innerHeight + window.scrollY >= this.document.body.scrollHeight;
  if (endOfPage && currentPage < lastPage) {
    currentPage++;
    getAllPosts(false, currentPage);
  }
});

// Register Function
function registerRequest(username, name, email, password, image) {
  const url = "https://tarmeezacademy.com/api/v1/register";
  const formData = new FormData();
  formData.append('username', username);
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('image', image);
  toggleLoader(true)
  axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  })
  .then((response) => {
    toggleLoader(false)
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    closeModal(RegisterModal);
    showAlert("Registeration Successfully", "success");
    setupUI();
  })
  .catch((error) => {
    const message = error.response?.data?.message || "Failed To Registeration";
    showAlert(message, "danger");
  });
}

// دالة تسجيل الدخول
function loginUser(username, password) {
  const url = "https://tarmeezacademy.com/api/v1/login";
  const params = { username, password };
  toggleLoader(true)
  axios.post(url, params)
    .then((response) => {
      toggleLoader(false)
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      closeModal(loginModal);
      showAlert("تم تسجيل الدخول بنجاح", "success");
      setupUI();
      //getAllPosts();
    })
    .catch((error) => {
      const message = error.response?.data?.message || "فشل في تسجيل الدخول";
      showAlert(message, "danger");
    }).finally(() => {
      toggleLoader(false)
    })
}

// دالة جلب جميع المنشورات
function getAllPosts(reload = true, page = 1) {
  toggleLoader(true)
  axios.get(`https://tarmeezacademy.com/api/v1/posts?page=${page}`)
    .then((response) => {
      toggleLoader(false)
      const data = response.data.data;
      lastPage = response.data.meta.last_page;

      // تحقق من أن عنصر 'posts' معرف
      const posts = document.getElementById("posts");
      if (posts) {
        // إذا كان reload مطلوب، أفرغ المحتويات القديمة
        if (reload) {
          posts.innerHTML = ''; // أفرغ المنشورات القديمة إذا كان reload = true
        }

        data.forEach((post) => {
          const postContent = createPostHTML(post);
          posts.innerHTML += postContent;
          addPostTags(post); // قم بإضافة الوسوم الخاصة بالمنشور
        });
      } else {
        console.error("Element with ID 'posts' not found.");
      }
    }).catch(() => {
      
    }).finally(() => {
      toggleLoader(false)
    })
}


// دالة إنشاء HTML للمنشور
function createPostHTML(post) {
  const postTitle = post.title || "";

  let user = getCurrentUser();
  let isMyPost = user != null && post.author.id == user.id;

  return `<!-- Post -->
  <div class="d-flex justify-content-center mt-5">
    <div class="col-9">
      <div class="card shadow post-card" id='post-${post.id}' onclick="postClicked(${post.id})" style='cursor: pointer'>
          <div class="card-header d-flex align-items-center">

              <span onclick="userClicked(event, ${post.author.id})">
                    <img class="rounded-circle border border-2 p-1"
                    src="${post.author.profile_image}"
                    alt="profile"
                    style="width: 2rem; height:2rem;">
                    <b class="ms-2">@${post.author.username}</b>
              </span>

              ${isMyPost ? `
                <div class="ms-auto">
                  <button class="btn btn-secondary me-2" onclick="editPost(event, '${encodeURIComponent(JSON.stringify(post))}')">Edit</button>
                  <button class="btn btn-danger" onclick="deletePost(event, '${encodeURIComponent(JSON.stringify(post))}')">Delete</button>
                </div>` : ""}
          </div>
        <div class="card-body">
          <img src="${post.image ? post.image : 'default-image.jpg'}" alt="post-img" class="w-100 rounded post-img-class" style='height: 40rem'>
          <h6 class="text-secondary mt-1 post-date-class">${post.created_at}</h6>
          <h5 class="card-title post-title-class">${postTitle}</h5>
          <p class="card-text post-body-class">${post.body}</p>
          <hr>
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="16" height="16"
              fill="currentColor" class="bi bi-pencil me-2"
              viewBox="0 0 16 16">
              <path
                d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
            </svg>
            <span>(${post.comments_count}) تعليقات</span>
            <span id="post-tags-${post.id}" class="ms-3">
              <!-- الوسوم ستُضاف هنا -->
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- End Post -->`;


}

// دالة إضافة الوسوم للمنشور
function addPostTags(post) {
  const tagsContainer = document.getElementById(`post-tags-${post.id}`);
  tagsContainer.innerHTML = "";

  post.tags.forEach(tag => {
    tagsContainer.innerHTML += `
      <button class="btn btn-sm rounded-5 me-1"
        style="background: gray; color:white">${tag.name}</button>
    `;
  });
}

// دالة الانتقال إلى صفحة تفاصيل المنشور
function postClicked(postId) {
  window.location = `postDetails.html?postId=${postId}`;
}

// التحقق من وجود معرف المنشور في URL
const urlSearch = new URLSearchParams(window.location.search);
const postId = urlSearch.get("postId");

if(postId) {
  getPost();
} 

// Assuming `postId` is retrieved correctly from the URL (see previous explanations)
function getPost() {
  const url = `https://tarmeezacademy.com/api/v1/posts/${postId}`
  toggleLoader(true)
  axios.get(url)
    .then((response) => {
      toggleLoader(false)
      const post = response.data.data;

      // Update username element
      if (document.getElementById("username")) {
        document.getElementById("username").innerHTML = post.author.username.toUpperCase();
      } else {
        console.warn("Element with ID 'username' not found. Username update skipped.");
      }

      // Generate comments HTML
      const commentsContent = post.comments.map(comment => createCommentHTML(comment)).join('');

      // Generate detailed post HTML
      const postContent = createDetailedPostHTML(post, commentsContent);

      // Update post container element (assuming ID is "post")
      if (document.getElementById("post")) {
        document.getElementById("post").innerHTML = postContent;
      } else {
        console.warn("Element with ID 'post' not found. Post content update skipped.");
      }
    })
    .catch((error) => {
      console.error(error);
      showAlert("فشل في جلب تفاصيل المنشور", "danger");
    }).finally(() => {
      toggleLoader(false)
    })
}
// دالة إنشاء HTML للتعليق
function createCommentHTML(comment) {
  return `
    <div class="p-3" style="background: #ddd;">
      <div>
        <img class="rounded-circle" style="width: 40px; height: 40px" src="${comment.author.profile_image}" alt="profile-pic">
        <b>@${comment.author.username}</b>
      </div>
      <div>
        ${comment.body}
      </div>
      <hr>
    </div>
  `;
}

// دالة إنشاء HTML لتفاصيل المنشور
function createDetailedPostHTML(post, commentsContent) {
  return `
    <!-- Post -->
    <div class="d-flex justify-content-center mt-5">
      <div class="col-9">
        <div class="card shadow post-card">
          <div class="card-header d-flex align-items-center">
            <img class="rounded-circle border border-2 p-1"
              src="${post.author.profile_image}"
              alt="profile"
              style="width: 2rem; height:2rem;">
            <b class="ms-2">@${post.author.username}</b>
          </div>
          <div class="card-body">
            <img src="${post.image}"
              alt="post-img" class="w-100 rounded" style='height: 40rem'>
            <h6 class="text-secondary mt-1">${post.created_at}</h6>
            <h5>${post.title || ""}</h5>
            <p>${post.body}</p>
            <hr>
            <div class="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg"
                width="16" height="16"
                fill="currentColor" class="bi bi-pencil me-2"
                viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
              </svg>
              <span>(${post.comments_count}) تعليقات</span>
            </div>
          </div>
          
          <!-- Comments -->
          <div id="comments">
            ${commentsContent}
          </div>
          <!-- End Comments -->

          <div class="input-group mb3" id="add-comment-div">
              <input id="comment-input" placeholder="Add Comment Here..."  class="form-control"/>
              <button class="btn btn-outline-primary" onclick="createCommentClicked()">Comment</button>
          </div>
        </div>
      </div>
    </div>
    <!-- End Post -->
  `;
}

// دالة إنشاء تعليق جديد
function createCommentClicked() {
  const commentInput = document.getElementById("comment-input").value;
  const token = localStorage.getItem("token");
  const url = `https://tarmeezacademy.com/api/v1/posts/${postId}/comments`;
  const params = {
    "body": commentInput,
  };
  
  axios.post(url, params, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(() => {
    getPost();
    showAlert("Add Comment Successfully", "success");
  }).catch((error) => {
    const errorMessage = error.response.data.message;
    showAlert(errorMessage, "danger");
  });
}

function createNewPost() {
  const token = localStorage.getItem("token");

  if (!token) {
    showAlert("You are not logged in. Please login to create a post.", "danger");
    return;
  }

  let postId = document.getElementById("post-id").value;
  const isCreate = postId == null || postId == "";

  const title = document.getElementById("post-title").value;
  const body = document.getElementById("post-body").value;
  const image = document.getElementById("post-img").files[0];

  const data = new FormData();
  data.append("title", title);
  data.append("body", body);
  if (image) {
    data.append("image", image);
  }
  toggleLoader(true)

  const headers = {
    "Authorization": `Bearer ${token}`
  }

  if(isCreate) {
    url = `https://tarmeezacademy.com/api/v1/posts`
    axios.post(url,data, {
      headers: headers
    })
    .then((response) => {
      toggleLoader(false)
      const modalInstance = bootstrap.Modal.getInstance(createNewPostModal)
      modalInstance.hide()
      showAlert("New Post Has Been Created", "success")
      getAllPosts()
    })
    .catch((error) => {
      showAlert("Operation failed: " + (error.response?.data?.message || error.message), "danger");
    }).finally(() => {
      toggleLoader(false)
    })
  }else{
    data.append("_method", "put")
    url = `https://tarmeezacademy.com/api/v1/posts/${postId}`
        axios.post(url,data, {
          headers: headers
        })
        .then((response) => {
          toggleLoader(false)
          const modalInstance = bootstrap.Modal.getInstance(createNewPostModal)
          modalInstance.hide()
          showAlert("New Post Has Been Created", "success")
          getAllPosts()
        })
        .catch((error) => {
          showAlert("Operation failed: " + (error.response?.data?.message || error.message), "danger");
        }).finally(() => {
          toggleLoader(false)
        })
  }
 
}



function closeModal(modalElement) {
  if (modalElement) {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    } else {
      console.error("Modal instance not found");
    }
  } else {
    console.error("Modal element not found");
  }
}


// حدث الضغط على زر التسجيل في المودال
btnRegisterModal.addEventListener("click", function () {
  registerRequest(
    modal_username.value,
    modal_name.value,
    modal_email.value,
    modal_password.value,
    uploadImageRegister.files[0]
  );
});

// حدث الضغط على زر تسجيل الدخول
btnLogin.addEventListener("click", function () {
  loginUser(userName.value, passWord.value);
});

// دالة تسجيل الخروج
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  disableAuthenticatedLinks()
  showAlert("Logout Successfully", "success");
  setupUI();
}

function disableAuthenticatedLinks() {
  window.location.href = "./index.html"
  // Select all links that should be disabled when logged out
  const authLinks = document.querySelectorAll('.auth-required');
  authLinks.forEach(link => {
    link.classList.add('disabled');
    link.setAttribute('tabindex', '-1');
    link.setAttribute('aria-disabled', 'true');
  });
}

// حدث الضغط على زر تسجيل الخروج
btnLogout.addEventListener("click", logout);

// دالة عرض التنبيهات
function showAlert(customMessage, type) {
  const alertPlaceholder = document.getElementById("success-alert");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible" role="alert">
      <div>${customMessage}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  alertPlaceholder.append(wrapper);

  // إخفاء التنبيه بعد 2 ثانية
  setTimeout(() => {
    const alertElement = alertPlaceholder.querySelector('.alert');
    if (alertElement) {
      const alertClose = bootstrap.Alert.getOrCreateInstance(alertElement);
      alertClose.close();
    }
  }, 2000);
}

// دالة إعداد واجهة المستخدم بناءً على حالة تسجيل الدخول
function setupUI() {
  const token = localStorage.getItem("token");
  const divLogin = document.getElementById("logged-in-div");
  const divLogout = document.getElementById("logout");
  const addBtn = document.getElementById("add-btn");

  const authLinks = document.querySelectorAll('.auth-required');

  if (token) {
    // User is logged in
    authLinks.forEach(link => {
      link.classList.remove('disabled');
      link.removeAttribute('tabindex');
      link.removeAttribute('aria-disabled');
    });
    // Show logout button, hide login button, etc.
  } else {
    // User is logged out
    authLinks.forEach(link => {
      link.classList.add('disabled');
      link.setAttribute('tabindex', '-1');
      link.setAttribute('aria-disabled', 'true');
    });
    // Hide logout button, show login button, etc.
  }

  if (token == null) {
    // المستخدم غير مسجل الدخول
    if(addBtn != null) {
      addBtn.style.setProperty("display", "none", "important");
    }
    divLogin.style.setProperty("display", "flex", "important");
    divLogout.style.setProperty("display", "none", "important");
  } else {
    // المستخدم مسجل الدخول
    if(addBtn != null) {
      addBtn.style.setProperty("display", "flex", "important");
    }
    divLogin.style.setProperty("display", "none", "important");
    divLogout.style.setProperty("display", "flex", "important");
    const user = getCurrentUser();
    if (user) {
      document.getElementById("nav-username").innerHTML = `@${user.username}`;
      document.getElementById("nav-user-image").src = user.profile_image;
    }
  }
}


// دالة الحصول على المستخدم الحالي
function getCurrentUser() {
  const userStorage = localStorage.getItem("user");
  return userStorage ? JSON.parse(userStorage) : null;
}

// دالة إغلاق المودال
function closeModal(modal) {
  if (modal) {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
  }
}

// Edit Post
function editPost(event, postObject) {
  event.stopPropagation();
  try {
    // فك ترميز وتحليل كائن المنشور
    let post = JSON.parse(decodeURIComponent(postObject));

    // التحقق من العناصر قبل تعيين القيم
    const submitButton = document.getElementById("post-modal-submit");
    const postIdInput = document.getElementById("post-id");
    const modalTitle = document.getElementById("post-modal-title");
    const postTitleInput = document.getElementById("post-title");
    const postBodyInput = document.getElementById("post-body");

    if (submitButton && postIdInput && modalTitle && postTitleInput && postBodyInput) {
      // تعيين القيم في الحقول
      submitButton.innerHTML = "Update";  
      postIdInput.value = post.id;
      modalTitle.innerHTML = "Edit Post";
      postTitleInput.value = post.title;
      postBodyInput.value = post.body;

      // فتح المودال
      let postModal = new bootstrap.Modal(createNewPostModal, {});
      postModal.show();  // استخدم .show() بدلاً من .toggle() لضمان فتح المودال
    } else {
      throw new Error("Some modal elements not found");
    }

  } catch (error) {
    console.error("Error parsing post object:", error);
    showAlert("Error opening edit modal", "danger");
  }
}


function deletePost(event, postObject) {
  event.stopPropagation();
  try {
    let post = JSON.parse(decodeURIComponent(postObject));
    document.getElementById("delete-post-id").value = post.id
    // فتح المودال
    let postModal = new bootstrap.Modal(document.getElementById("deletePost"), {});
    postModal.toggle();
  } catch(error) {
    console.error("Error parsing post object:", error);
    showAlert("Error opening edit modal", "danger");
  }
}

function confirmPostDelete() {
  const postId = document.getElementById("delete-post-id").value
  const url = `https://tarmeezacademy.com/api/v1/posts/${postId}`;
  const token = localStorage.getItem("token")
  const headers = {
    "authorization": `Bearer ${token}`
  }
  axios.delete(url, {
    headers: headers
  })
    .then((response) => {

      closeModal(loginModal);
      const modal = document.getElementById("deletePost")
      const modalInstance = bootstrap.Modal.getInstance(modal)
      modalInstance.hide()
      showAlert("The Post Has Been Deleted Successfully", "success");
      getAllPosts();
    })
    .catch((error) => {
      const message = error.response?.data?.message;
      showAlert(message, "danger");
    });
}


function addBtnClicked(event) {
  event.stopPropagation(); // منع انتشار الحدث

  // إعادة تعيين حقول النموذج لإنشاء منشور جديد
  document.getElementById("post-id").value = "";
  document.getElementById("post-modal-title").innerHTML = "Create Post";
  document.getElementById("post-modal-submit").innerHTML = "Create";
  document.getElementById("post-title").value = "";
  document.getElementById("post-body").value = "";

  // فتح الـ modal لإنشاء منشور جديد
  let postModal = new bootstrap.Modal(createNewPostModal, {});
  postModal.toggle();
}

function getCurrentUserId() {
    // التحقق من وجود معرف المنشور في URL
  const urlSearch = new URLSearchParams(window.location.search);
  const id = urlSearch.get("userid"); 
  return id
}


function getUserInfoProfile() {
  const id = getCurrentUserId()
  toggleLoader(true)
  axios.get(`https://tarmeezacademy.com/api/v1/users/${id}`)
  .then((response) => {
    toggleLoader(false)
    const user  = response.data.data
    
  const content = `
  <div class="row">
        <!-- User Image Col -->
            <div class="col-2">
              <img id="header-img" src="${user.profile_image}" alt="profile-pic" style="width: 120px; height:120px; border-radius:200px;">
            </div>
          <!-- End User Image Col -->

            <!-- UserName - Email - Name -->
              <div class="col-4 d-flex flex-column justify-content-evenly" style="font-weight: bold;">
                  <div class="user-main-info">${user.email}</div>
                  <div class="user-main-info">${user.name}</div>
                  <div class="user-main-info">${user.username}</div>
              </div>
            <!-- End UserName - Email - Name -->

            <!-- Posts & Comments Count -->
              <div class="col-4 d-flex flex-column justify-content-center" style="font-weight: bold;">
                <div class="number-info">
                    <span>${user.posts_count}</span> Posts
              </div>

                <div class="number-info">
                    <span>${user.comments_count}</span> Comments
                </div>
              </div>
            <!-- End Posts & Comments Count -->
    </div>

`

 document.getElementById("card-body").innerHTML += content;
  }
).catch((error) => {
  
}).finally(() => {
  toggleLoader(false)
})
}


function userClicked(event, userid) {
  event.stopPropagation();
  window.location = `/profile.html?userid=${userid}`
}


function profileClicked() {
  const user = getCurrentUser()
  window.location = `./profile.html?userid=${user.id}`
}

function getPosts() {
  const id = getCurrentUserId()
  toggleLoader(true)
  axios.get(`https://tarmeezacademy.com/api/v1/users/${id}/posts`)
    .then((response) => {
      toggleLoader(false)
      const data = response.data.data;
      document.getElementById("userInfo").innerHTML = ""
      // تحقق من أن عنصر 'posts' معرف
      const posts = document.getElementById("userInfo");
      if (posts) {
        data.forEach((post) => {
          const postContent = createPostHTML(post);
          posts.innerHTML += postContent;
          addPostTags(post); // قم بإضافة الوسوم الخاصة بالمنشور
          document.getElementById("username-post").innerHTML = post.author.username
        });
      } else {
        console.error("Element with ID 'posts' not found.");
      }
    }).catch((error) => {
      
    }).finally(() => {
      toggleLoader(false)
    })
}

function toggleLoader(show = true) {
  if(show) {
    document.getElementById("loader").style.visibility = "visible"
  }else {
    document.getElementById("loader").style.visibility = "hidden"
  }
}

getPosts()
getUserInfoProfile()