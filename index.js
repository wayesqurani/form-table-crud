// index.js

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('userForm');
  const dataBody = document.getElementById('dataBody');
  const bulkSelect = document.getElementById('selectAll');

  const editForm = document.getElementById('editForm');
  const editId = document.getElementById('editEntryID');
  const editName = document.getElementById('editName');
  const editEmail = document.getElementById('editEmail');
  const editPhone = document.getElementById('editPhone');
  const editModal = document.getElementById('editModal');

  let entry = JSON.parse(localStorage.getItem('entry')) || [];

  function saveToLocalStorage() {
    localStorage.setItem('entry', JSON.stringify(entry));
  }

  function addRowToTable(entryItem) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-entry-id', entryItem.entryID);

    tr.innerHTML = `
      <td class="p-2 border text-center">
        <input type="checkbox" class="rowCheckbox" />
      </td>
      <td class="p-2 border">${entryItem.name}</td>
      <td class="p-2 border">${entryItem.email}</td>
      <td class="p-2 border">${entryItem.phone}</td>
      <td class="p-2 border text-center relative">
        <button class="dotsMenuBtn text-xl font-bold px-2 py-1 hover:bg-gray-200 rounded">\u22EE</button>
        <div class="actionMenu hidden absolute right-2 top-full mt-1 w-36 bg-white border border-gray-200 shadow-lg rounded z-20 text-left">
          <button onclick="editEntry('${entryItem.entryID}')" class="block w-full px-4 py-2 hover:bg-gray-100 text-sm">\uD83D\uDCDD Update</button>
          <button onclick="cloneEntry('${entryItem.entryID}')" class="block w-full px-4 py-2 hover:bg-gray-100 text-sm">\u2795 Clone</button>
          <button onclick="deleteEntry('${entryItem.entryID}')" class="block w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-sm">\uD83D\uDDD1\uFE0F Delete</button>
        </div>
      </td>
    `;
    dataBody.appendChild(tr);
  }

  entry.forEach(entryItem => addRowToTable(entryItem));

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    const newEntry = {
      entryID: Date.now(),
      name,
      email,
      phone
    };

    entry.push(newEntry);
    saveToLocalStorage();
    addRowToTable(newEntry);
    form.reset();
  });

  document.addEventListener('click', function (e) {
    document.querySelectorAll('.actionMenu').forEach(menu => {
      if (!menu.contains(e.target) && !e.target.classList.contains('dotsMenuBtn')) {
        menu.classList.add('hidden');
      }
    });

    if (e.target.classList.contains('dotsMenuBtn')) {
      const menu = e.target.nextElementSibling;
      if (menu) {
        menu.classList.toggle('hidden');
      }
    }
  });

  window.cloneEntry = function (entryID) {
    const id = Number(entryID);
    const original = entry.find(item => item.entryID === id);
    if (!original) return alert("Entry not found");

    const cloned = { ...original, entryID: Date.now() + Math.floor(Math.random() * 1000) };
    entry.push(cloned);
    saveToLocalStorage();
    addRowToTable(cloned);
  };

  window.editEntry = function (entryID) {
    const id = Number(entryID);
    const entryItem = entry.find(e => e.entryID === id);
    if (!entryItem) return;

    editId.value = entryItem.entryID;
    editName.value = entryItem.name;
    editEmail.value = entryItem.email;
    editPhone.value = entryItem.phone;
    editForm.dataset.bulk = "false";
    editModal.classList.remove('hidden');
  };

  document.getElementById('cancelEdit').addEventListener('click', function () {
    editModal.classList.add('hidden');
  });

  editForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let entries = JSON.parse(localStorage.getItem('entry')) || [];

    const isBulk = editForm.dataset.bulk === "true";
    const name = editName.value.trim();
    const email = editEmail.value.trim();
    const phone = editPhone.value.trim();

    if (isBulk) {
      const ids = JSON.parse(editForm.dataset.ids || '[]');

      entries = entries.map(entry => {
        if (ids.includes(entry.entryID.toString())) {
          return {
            ...entry,
            name: name || entry.name,
            email: email || entry.email,
            phone: phone || entry.phone
          };
        }
        return entry;
      });

      ids.forEach(id => {
        const row = document.querySelector(`tr[data-entry-id="${id}"]`);
        if (row) {
          if (name) row.children[1].textContent = name;
          if (email) row.children[2].textContent = email;
          if (phone) row.children[3].textContent = phone;
        }
      });

      editForm.dataset.bulk = "";
      editForm.dataset.ids = "";

    } else {
      const id = editId.value;
      const index = entries.findIndex(entry => entry.entryID == id);
      if (index !== -1) {
        entries[index].name = name;
        entries[index].email = email;
        entries[index].phone = phone;

        const row = document.querySelector(`tr[data-entry-id="${id}"]`);
        if (row) {
          row.children[1].textContent = name;
          row.children[2].textContent = email;
          row.children[3].textContent = phone;
        }
      }
    }

    localStorage.setItem('entry', JSON.stringify(entries));
    editModal.classList.add('hidden');
  });

  function getSelectedEntryIDs() {
    const checkboxes = document.querySelectorAll('.rowCheckbox:checked');
    const ids = [];
    checkboxes.forEach(checkbox => {
      const tr = checkbox.closest('tr');
      if (tr) ids.push(tr.getAttribute('data-entry-id'));
    });
    return ids;
  }

  window.bulkClone = function () {
    const selectedIDs = getSelectedEntryIDs();
    if (selectedIDs.length === 0) return;

    const newEntries = [];
    selectedIDs.forEach(id => {
      const original = entry.find(e => e.entryID.toString() === id);
      if (original) {
        const clone = { ...original, entryID: Date.now() + Math.floor(Math.random() * 1000) };
        entry.push(clone);
        newEntries.push(clone);
      }
    });

    saveToLocalStorage();
    newEntries.forEach(addRowToTable);
  };

  window.bulkDelete = function () {
    const selectedIDs = getSelectedEntryIDs();
    if (selectedIDs.length === 0) return;

    entry = entry.filter(e => !selectedIDs.includes(e.entryID.toString()));
    saveToLocalStorage();

    selectedIDs.forEach(id => {
      const row = document.querySelector(`tr[data-entry-id="${id}"]`);
      if (row) row.remove();
    });
  };

  window.bulkUpdate = function () {
    const selectedIDs = getSelectedEntryIDs();
    if (selectedIDs.length === 0) return;

    editForm.dataset.bulk = "true";
    editForm.dataset.ids = JSON.stringify(selectedIDs);
    editId.value = '';
    editName.value = '';
    editEmail.value = '';
    editPhone.value = '';
    editModal.classList.remove('hidden');
  };

  window.deleteEntry = function (id) {
    entry = entry.filter(item => item.entryID != id);
    saveToLocalStorage();
    const row = document.querySelector(`tr[data-entry-id="${id}"]`);
    if (row) row.remove();
  };

  window.toggleAll = function (checkbox) {
    const allCheckboxes = document.querySelectorAll('.rowCheckbox');
    allCheckboxes.forEach(cb => cb.checked = checkbox.checked);
  };
});