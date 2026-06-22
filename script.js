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
let grid = document.querySelector('.grid')
let categoryDropDown = document.querySelector('#categoryDropDown')
let deleteOverlay= document.querySelector(".deleteOverlay")
let deleteBtn = document.querySelector(".confirm-delete")

let activeTab
let tabs
let updateCategory = false
let categories = JSON.parse(localStorage.getItem("categoryList"))

function updateCategories(){

    categories = JSON.parse(localStorage.getItem("categoryList"))
    categories.forEach(category=>{
        if(!data[category]){
            data[category] = []
            localStorage.setItem("data", JSON.stringify(data))
        }
    })
    categoryDropDown.innerHTML = `<option value="">-- select category --</option>`
    categoryTabs.innerHTML = ''
    categories.forEach(category=>{
        categoryTabs.innerHTML += `<h4 class="tabs" name="${category}">${category.toUpperCase()}</h4>`
        categoryDropDown.innerHTML += `<option value="${category}">${category.split(" ").join("_").toUpperCase()}</option>`
    })
    categoryDropDown.innerHTML += `<option id="customCategory" value="custom">Custom</option>`

    activeTab = JSON.parse(localStorage.getItem("activeTab")) || categories[0]
    
    tabs = document.querySelectorAll(".tabs")

    tabs.forEach((item)=>{
        if(item.getAttribute("name") == activeTab){
            item.classList.add("activeCategory")        
        }
    })
}

function findActiveTag(){
    categoryTabs.addEventListener('click', (e)=>{
        tabs.forEach(t=>t.classList.remove("activeCategory"))
        e.target.closest('h4').classList.add("activeCategory")
        activeTab = e.target.closest("h4").getAttribute("name");    
        localStorage.setItem("activeTab", JSON.stringify(e.target.closest("h4").getAttribute("name")))
        render()
    })
}

updateCategories()
findActiveTag()
render()


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
        return
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
    let censusNumber = form.census.value
    let mobileNumber = form.mobile.value
    let name = form.name.value
    let address = form.address.value
    let category = form.category.value
    let status = form.status.value
    let remarks = form.remarks.value


    if(category.trim() === ""){
        alert("Please select a category")
        return
    }

    if(updateIndex === null){
        let id = Date.now();
        data[category].push({id, censusNumber, mobileNumber, name, address, category, status, remarks})
    }else if(updateIndex){

        if(updateCategory == true){
            let index = data[activeTab].findIndex(item=>item.id == updateIndex)
            data[activeTab].splice(index,1)
            let id = Date.now();
            data[category].push({id, censusNumber, mobileNumber, name, address, category, status, remarks})
        }else{
            let target = data[activeTab].find(item=>item.id==updateIndex)
            if(!target) return
            target.censusNumber = censusNumber
            target.mobileNumber = mobileNumber
            target.name = name
            target.category = category
            target.status = status
            target.address = address
            target.remarks = remarks
            updateIndex = null
        }   

    }

    localStorage.setItem("data", JSON.stringify(data))

    form.reset()
    overlay.style.display = "none"
    render()
}


form.addEventListener('submit', (e)=>{
    handleFormSubmit(e)
})


function render(dataArr = data[activeTab] || []){

    let ui = ''
    grid.innerHTML = ui

    if(dataArr.length<1){
        ui = '<h1>No data</h1>'
    }else{        
        dataArr.forEach(item=>{
        ui += `                
            <div class="card ${item.status}" data-id="${item.id}" data-status="${item.status}">        
                <div class="left">
                    <h2>${item.name}</h2>
                    <p>CENSUS NUMBER: <span class="numspan">${item.censusNumber}</span></p>
                    <p>MOBILE NUMBER: <span class="numspan"><a href="tel:+">${item.mobileNumber}</a></span></p>
                    <p>Address: ${item.address}</p>
                    <p class="remarks">Remark: ${item.remarks}</p>
                    </div>
                    <div class="right">
                    <i class="ri-delete-bin-6-fill"></i>
                </div>
            </div>
            `     
        })
    }
    grid.innerHTML = ui
}



grid.addEventListener('click', (e)=>{
    
    let card = e.target.closest(".card")
    let nums = e.target.closest(".numspan")

    if(!card) return
    if(nums) return

    let btn = e.target.closest(".right")
    if(btn){
        handleDelete(card.getAttribute("data-id"), activeTab);
        return
    }

    handleUpdate(card)
})


function handleUpdate(c){
    updateIndex = c.dataset.id
    const item = data[activeTab].find(item => item.id == updateIndex);
    if(!item) return;
    overlay.style.display = "flex";
    editBTN.textContent = "edit"
    document.getElementsByName("census")[0].value = item.censusNumber;
    document.getElementsByName("mobile")[0].value = item.mobileNumber;
    document.getElementsByName("name")[0].value = item.name;
    document.getElementsByName("address")[0].value = item.address;
    document.getElementsByName("category")[0].value = item.category;
    document.getElementsByName("status")[0].value = item.status
    document.getElementsByName("remarks")[0].value = item.remarks;
    
    document.getElementsByName("category")[0].addEventListener("change", (e)=>{
        if(e.target.value != item.category){
            updateCategory = true
        }else{
            updateCategory = false
        }
    })

}

function handleDelete(id, activeTab) {
    deleteOverlay.style.display = "initial";

    deleteBtn.onclick = () => {
        const index = data[activeTab].findIndex(
            item => item.id == id
        );

        console.log(index);

        if (index === -1) return;

        data[activeTab].splice(index, 1);
        localStorage.setItem("data", JSON.stringify(data));

        deleteOverlay.style.display = "none";
        render();
    };
}

deleteOverlay.onclick = () => {
    deleteOverlay.style.display = "none";
};


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
      .catch(err => console.log(err));
  });
}