const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);
let students = JSON.parse(localStorage.getItem('ae_students') || 'null') || [
 {id:'1',reg:'CS001',name:'Anitha Kumar',dept:'B.Sc Computer Science',email:'anitha@example.com'},
 {id:'2',reg:'CS002',name:'Bala Devi',dept:'B.Sc Computer Science',email:'bala@example.com'},
 {id:'3',reg:'CS003',name:'Charan Raj',dept:'B.Sc Computer Science',email:'charan@example.com'},
 {id:'4',reg:'CS004',name:'Divya S',dept:'B.Sc Computer Science',email:'divya@example.com'}
];
let records = JSON.parse(localStorage.getItem('ae_records') || '[]');
let selectedDate = today();
let editId = null;
function saveData(){localStorage.setItem('ae_students',JSON.stringify(students));localStorage.setItem('ae_records',JSON.stringify(records))}
function statusFor(id,date=selectedDate){const r=records.find(x=>x.id===id&&x.date===date);return r?r.status:'Not Marked'}
function badge(s){return `<span class="status ${s==='Not Marked'?'Excused':s}">${s}</span>`}
function toast(msg){$('toast').textContent=msg;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2300)}
function showView(name){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===name));document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$('crumb').textContent=name==='overview'?'Overview':name==='students'?'Students':name==='attendance'?'Attendance':'Attendance History';renderAll()}
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));
function renderAll(){renderDashboard();renderStudents();renderAttendance();renderHistory()}
function renderDashboard(){
 const marked=students.filter(s=>['Present','Absent','Late','Excused'].includes(statusFor(s.id))).length;
 const present=students.filter(s=>statusFor(s.id)==='Present').length;
 const absent=students.filter(s=>statusFor(s.id)==='Absent').length;
 $('totalCount').textContent=students.length;$('presentCount').textContent=present;$('absentCount').textContent=absent;
 $('rateCount').textContent=(marked?Math.round(present/marked*100):0)+'%';
 const q=$('overviewSearch').value.toLowerCase();
 const list=students.filter(s=>(s.name+' '+s.reg+' '+s.dept).toLowerCase().includes(q));
 $('overviewRows').innerHTML=list.map(s=>`<tr><td>${esc(s.reg)}</td><td>${esc(s.name)}</td><td>${esc(s.dept)}</td><td>${badge(statusFor(s.id))}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">No students found.</td></tr>';
}
function renderStudents(){
 const q=$('studentSearch').value.toLowerCase();
 const list=students.filter(s=>(s.name+' '+s.reg+' '+s.dept).toLowerCase().includes(q));
 $('studentRows').innerHTML=list.map(s=>`<tr><td>${esc(s.reg)}</td><td>${esc(s.name)}</td><td>${esc(s.dept)}</td><td>${esc(s.email||'—')}</td><td><div class="actions"><button class="small-btn" data-edit="${s.id}">Edit</button><button class="small-btn delete" data-delete="${s.id}">Delete</button></div></td></tr>`).join('')||'<tr><td colspan="5" class="empty">No students found.</td></tr>';
}
function renderAttendance(){
 selectedDate=$('attendanceDate').value||today();
 $('attendanceRows').innerHTML=students.map(s=>`<tr><td>${esc(s.reg)}</td><td>${esc(s.name)}</td><td>${esc(s.dept)}</td><td><select data-status-id="${s.id}">${['Present','Absent','Late','Excused'].map(st=>`<option ${statusFor(s.id,selectedDate)===st?'selected':''}>${st}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan="4" class="empty">Add students first.</td></tr>';
}
function renderHistory(){
 const d=$('historyDate').value, st=$('historyStatus').value;
 const list=records.filter(r=>(!d||r.date===d)&&(st==='All'||r.status===st)).sort((a,b)=>b.date.localeCompare(a.date));
 $('historyRows').innerHTML=list.map(r=>{const s=students.find(x=>x.id===r.id)||{reg:r.reg||'—',name:r.name||'Deleted student',dept:r.dept||'—'};return `<tr><td>${r.date}</td><td>${esc(s.reg)}</td><td>${esc(s.name)}</td><td>${esc(s.dept)}</td><td>${badge(r.status)}</td></tr>`}).join('')||'<tr><td colspan="5" class="empty">No saved attendance records.</td></tr>';
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openForm(s=null){editId=s?s.id:null;$('modalTitle').textContent=s?'Edit Student':'Add Student';$('editId').value=s?s.id:'';$('regNo').value=s?s.reg:'';$('studentName').value=s?s.name:'';$('department').value=s?s.dept:'';$('email').value=s?s.email||'':'';$('studentModal').classList.remove('hidden')}
function closeForm(){$('studentModal').classList.add('hidden');$('studentForm').reset();editId=null}
$('addStudent').addEventListener('click',()=>openForm());$('closeModal').addEventListener('click',closeForm);$('cancelModal').addEventListener('click',closeForm);
$('studentForm').addEventListener('submit',e=>{e.preventDefault();const item={id:editId||String(Date.now()),reg:$('regNo').value.trim(),name:$('studentName').value.trim(),dept:$('department').value.trim(),email:$('email').value.trim()};if(students.some(s=>s.reg.toLowerCase()===item.reg.toLowerCase()&&s.id!==editId)){toast('Register number already exists.');return}if(editId)students=students.map(s=>s.id===editId?item:s);else students.push(item);saveData();closeForm();renderAll();toast('Student details saved.')});
document.addEventListener('click',e=>{const ed=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(ed){const s=students.find(x=>x.id===ed.dataset.edit);if(s)openForm(s)}if(del){const s=students.find(x=>x.id===del.dataset.delete);if(s&&confirm(`Delete ${s.name}?`)){students=students.filter(x=>x.id!==s.id);saveData();renderAll();toast('Student deleted.')}}});
$('overviewSearch').addEventListener('input',renderDashboard);$('studentSearch').addEventListener('input',renderStudents);
$('attendanceDate').value=today();$('attendanceDate').addEventListener('change',()=>{selectedDate=$('attendanceDate').value;renderAttendance();renderDashboard()});
$('allPresent').addEventListener('click',()=>{document.querySelectorAll('[data-status-id]').forEach(x=>x.value='Present');toast('All students set to Present. Click Save Attendance.')});
$('saveAttendance').addEventListener('click',()=>{selectedDate=$('attendanceDate').value||today();document.querySelectorAll('[data-status-id]').forEach(x=>{records=records.filter(r=>!(r.id===x.dataset.statusId&&r.date===selectedDate));records.push({id:x.dataset.statusId,date:selectedDate,status:x.value})});saveData();renderAll();toast('Attendance saved successfully.')});
$('historyDate').addEventListener('change',renderHistory);$('historyStatus').addEventListener('change',renderHistory);$('clearFilters').addEventListener('click',()=>{$('historyDate').value='';$('historyStatus').value='All';renderHistory()});
$('exportCsv').addEventListener('click',()=>{if(!records.length){toast('No records to export yet.');return}const rows=[['Date','Register Number','Student Name','Department','Status'],...records.map(r=>{const s=students.find(x=>x.id===r.id)||{};return [r.date,s.reg||'',s.name||'Deleted student',s.dept||'',r.status]})];const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));a.download='attendance-history.csv';a.click();URL.revokeObjectURL(a.href);toast('CSV exported.')});
$('todayLabel').textContent=new Date().toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
saveData();renderAll();