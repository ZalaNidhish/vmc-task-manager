if(!JSON.parse(localStorage.getItem("categoryList"))){
    localStorage.setItem("categoryList", JSON.stringify(['name_transfer', 'assesment', 'vandha_arji', 'proffessional_tax', 'misc'] ))
}

let data = JSON.parse(localStorage.getItem("data")) || {}

let updateIndex = null

let categoryTabs = document.querySelector("#catagoryTabs")
let addBTN = document.querySelector("#addBTN")
let closeBTN = document.querySelector(".close")
let editBTN = document.querySelector("#edit")
let form = document.querySelector('form')
let overlay = document.querySelector('.overlay')
let screen = document.querySelector('.screen')
let grid = document.querySelector('.grid')
let categoryDropDown = document.querySelector('#categoryDropDown')

let activeTab

let categories = JSON.parse(localStorage.getItem("categoryList"))


function updateCategories(){

    categories = JSON.parse(localStorage.getItem("categoryList"))
    categories.forEach(category=>{
        if(!data[category]) data[category] = []
    })
    categoryDropDown.innerHTML = `<option value="">-- select category --</option>`
    categoryTabs.innerHTML = ''
    categories.forEach(category=>{
        categoryTabs.innerHTML += `<h4 class="tabs" name="${category}">${category.toUpperCase()}</h4>`
        categoryDropDown.innerHTML += `<option value="${category}">${category.split(" ").join("_").toUpperCase()}</option>`
    })
    categoryDropDown.innerHTML += `<option id="customCategory" value="custom">Custom</option>`

    let tabs = document.querySelectorAll(".tabs")    

    activeTab = JSON.parse(localStorage.getItem("activeTab")) || categoryTabs.firstChild
    
    tabs.forEach((item)=>{
        if(item.getAttribute("name") == activeTab){
            item.classList.add("activeCategory")        
        }
    })
}

updateCategories()
render()

let tabs = document.querySelectorAll(".tabs")

function findActiveTag(){
    categoryTabs.addEventListener('click', (e)=>{
        tabs.forEach(t=>t.classList.remove("activeCategory"))
        e.target.closest('h4').classList.add("activeCategory")
        activeTab = e.target.innerHTML.toLowerCase().split(" ").join("_")    
        render()
        localStorage.setItem("activeTab", JSON.stringify(e.target.closest("h4").getAttribute("name")))
    })
}

findActiveTag()

addBTN.addEventListener('click', ()=>{
    overlay.style.display = "flex";
    categoryDropDown.value = activeTab
    editBTN.textContent = "Add"
})

closeBTN.addEventListener('click', (e)=>{
    form.reset()
    overlay.style.display = "none"
    updateIndex = null
})


let newCategory = document.querySelector("#newCategory")
let newCategoryinput = document.querySelector(".newCategory")
let addNewCategory = document.querySelector(".addNewCategory")
let selectCategory = document.querySelector("#selectCategory")

categoryDropDown.addEventListener('change', (e)=>{
    if(e.target.value == "custom"){
        selectCategory.style.display = "none"
        newCategory.style.display = "initial"
    }   
})

addNewCategory.addEventListener('click', ()=>{
    if(newCategoryinput.value.trim() == ''){
        alert("Enter valid category name")
        return
    }
    categories.splice(categories.length-1, 0, newCategoryinput.value)
    localStorage.setItem("categoryList", JSON.stringify(categories))
    updateCategories()
    selectCategory.style.display = "initial"
    categoryDropDown.value = newCategoryinput.value
    newCategory.style.display = "none"
})


function handleFormSubmit(e){
    
    e.preventDefault()
    let censusNumber = e.target[1].value
    let mobileNumber = e.target[3].value
    let name = e.target[5].value
    let address = e.target[7].value
    let category = e.target[9].value
    let customCategory = e.target[11].value
    let status = e.target[13].value
    let remarks = e.target[16].value


    if(censusNumber.trim() === "" || mobileNumber.trim() === "" || name.trim() === "" || address.trim() === "" || category.trim() === ""){
        alert("Please fill all required fields")
        return
    }

    function generateID(){
        return Math.floor(Math.random()*8999 + 1000)
    }

    if(!updateIndex){
        let id = generateID()
        while(data[category].find(item=>item.id == id)){
            id = generateID()
        }
        data[category].push({id, censusNumber, mobileNumber, name, address, category, status, remarks})
    }else{
        let target = data[activeTab].find(item=>item.id==updateIndex)
        target.censusNumber = censusNumber
        target.mobileNumber = mobileNumber
        target.name = name
        target.category = category
        target.status = status
        target.address = address
        target.remarks = remarks
        updateIndex = null
    }

    localStorage.setItem("data", JSON.stringify(data))

    form.reset()
    overlay.style.display = "none"
    render()
}

form.addEventListener('submit', (e)=>{
    handleFormSubmit(e)
})


function render(dataArr = data[activeTab]){

    grid.innerHTML = ''
    dataArr.forEach(item=>{
        grid.innerHTML += `                
            <div class="card ${item.status}" data-id="${item.id}" data-status="${item.status}">        
                <div class="left">
                    <h3>${item.name}</h3>
                    <div class="numbers">
                        <h4>${item.censusNumber}</h4>
                        <span>|</span>
                        <h4>${item.mobileNumber}</h4>
                    </div>
                    <p>${item.address}</p>
                    <p class="remarks">${item.remarks}</p>
                </div>
                <div class="right">
                    <i class="ri-delete-bin-6-fill"></i>
                </div>

            </div>
        `
    })
}


let deleteBTN = document.querySelectorAll(".right")
let card = document.querySelectorAll(".card")
card.forEach(c=>{
    c.addEventListener('click', (e)=>{
        let target = e.target.closest(".card")
        let btn = e.target.closest(".right")
        if(btn) handleDelete(target.getAttribute("data-id"), activeTab);
        else{
            updateIndex = c.getAttribute("data-id")
            overlay.style.display = "flex";
            form[1].value = c.children[0].children[1].children[0].textContent
            form[3].value = c.children[0].children[1].children[2].textContent
            form[5].value = c.children[0].children[0].textContent
            form[7].value = c.children[0].children[2].textContent
            form[9].value = activeTab
            form[11].value = c.getAttribute("data-status")
            form[13].value = c.children[0].children[3].textContent
        }
    })
})

function handleDelete(id, activeTab){
    let index = data[activeTab].findIndex(item=>item.id==id)
    if(confirm("confirm delete")){
        data[activeTab].splice(index,1)
        localStorage.setItem("data", JSON.stringify(data))
        render()
    }
}

let search = document.querySelector('#search')

search.addEventListener('input', (e)=>{
    let query = e.target.value
    let filteredItems = data[activeTab].filter(item=>{
        if(item.name.includes(query) || item.censusNumber.includes(query) || item.mobileNumber.includes(query) || item.address.includes(query) || item.remarks.includes(query)){
            return item
        }
    })
    render(filteredItems)
})



if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("SW Registered"))
      .catch(err => console.log(err));
  });
}