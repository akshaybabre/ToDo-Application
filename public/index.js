

function LoadView(url) {
  $.ajax({
    method: 'get',
    url: url,
    success: (res) => {
      $('section').html(res);
    }
  });
};

$(() => {
  if ($.cookie('uname')) {
    LoadDashboard();
  } else {
    LoadView('./home.html')
  }

  $(document).on('click', '#home-register-button', () => {
    LoadView('./register.html')
  })

  $(document).on('click', '#home-login-button', () => {
    LoadView('./login.html')
  })

  $(document).on('click', '#btn-home', () => {
    LoadView('./home.html')
  })

  $(document).on('click', '#home-login-button', () => {
    LoadView('./login.html')
  })

  $(document).on('click', '#home-register-button', () => {
    LoadView('./register.html')
  })

  //Verify User Name
  $(document).on('keyup', '#txtUserName', () => {
    $.ajax({
      method: 'get',
      url: 'http://localhost:4050/users',
      success: (users) => {
        for (var user of users) {
          if (user.username === $('#txtUserName').val()) {
            $('#unError').html('User Name is Taken - Try Another').css('color', 'red');
            break;
          } else {
            $('#unError').html('User Name is Available').css('color', 'green');
          }
        }
      }
    })
  })

  //Register

  $(document).on('click', '#btnRegister', () => {
    var user = {
      username: $('#txtUserName').val(),
      password: $('#txtPassword').val(),
      email: $('#txtEmail').val()
    };
    //Storing User details
    $.ajax({
      method: 'post',
      url: 'http://localhost:4050/register-user',
      data: user,
      success: () => {
        alert('Registered Successfull! ✅');
        LoadView('./login.html');
      },
      error: (err) => {
        alert('Registration Failed ❌');
        console.log(err);
      }
    });
  });

  //LoadDashboard
  function LoadDashboard() {
    $.ajax({
      method: 'get',
      url: './dashboard.html',
      success: (res) => {
        $('section').html(res);
        $('#active-user').html($.cookie('uname'));

        $.ajax({
          method: 'get',
          url: 'http://localhost:4050/appointments',
          success: (appointments) => {
            var results = appointments.filter(appointment => appointment.username === $.cookie('uname'));
            results.map(appointment => {
              $(`
               <div class="col-md-6">
                <div class="card p-3 mb-3">
                 <h4 class="text-primary">${appointment.title}</h4>
                 <p>${appointment.description}</p>
                 <div class="text-muted"><i class="bi bi-calendar"></i> ${appointment.date}</div>
                 <div class="mt-2">
                 <button id="btn-Edit" value=${appointment.id} data-bs-target="#edit-appointment" data-bs-toggle="modal" class="btn btn-warning">
                 <i class="bi bi-pen-fill"></i> Edit
                 </button>
                 <button id="btn-Delete" value=${appointment.id} class="btn btn-danger btn-sm mx-2">
                <i class="bi bi-trash-fill"></i> Delete
                 </button>
                 </div>
                </div>
                 </div>
               `).appendTo('#appointment-cards');
            });
          },
          error: (err) => {
            console.log("Error fetching appointments:", err);
          }
        });
      },
      error: (err) => {
        console.log("Error loading dashboard:", err);
      }
    });
  }

  //login
  $(document).on('click', '#btnLogin', () => {
    $.ajax({
      method: 'get',
      url: 'http://localhost:4050/users',
      success: (users) => {
        var user = users.find(item => item.username === $('#txtloginUserName').val());
        if (user) {
          if (user.password === $('#txtloginPassword').val()) {
            $.cookie('uname', $('#txtloginUserName').val()),
              LoadDashboard();
          } else {
            $('#pwloginError').html('Invalid Password').css('color', 'red');
          }
        } else {
          $('#unloginError').html('Invalid User Name').css('color', 'red');
        }
      }
    });
  });

  //sign Out
  $(document).on('click', '#btn-signout', () => {
    $.removeCookie('uname');
    LoadView('./home.html');
  })

  //  Add appointment 

  $(document).on('click', '#btn-add', () => {
    $.ajax({
      method:'get',
      url:'http://localhost:4050/appointments',
      success:(appointments) => {
        const maxId = appointments.reduce((max, a) => a.id > max ? a.id : max, 0);
        const nextId = maxId + 1;

        const appointment = {
          id: nextId,
          title: $('#appointment-title').val(),
          description: $('#appointment-description').val(),
          date: $('#appointment-date').val(),
          username: $.cookie('uname')
        };

        $.ajax({
          method: 'post',
          url: 'http://localhost:4050/add-appointment',
          data: appointment,
          success: () => {
            $('#add-appointment').modal('hide');
            LoadDashboard();
          },
          error: (err) => {
            alert('Failed to add appointment ❌');
            console.error(err);
          }
        });
      },
      error: (err) => {
        alert('Failed to fetch appointments ❌');
        console.error(err);
      }
    });
  });

  
           //Delete-Appointment
  $(document).on('click', '#btn-Delete', (e) => {
    var flag = confirm('Are You Sure? You want to Delete?');
    if (flag === true) {
      const appointmentId = $(e.currentTarget).val();
      $.ajax({
        method: 'delete',
        url: `http://localhost:4050/delete-appointment/${appointmentId}`,
        success: () => {
          LoadDashboard();
        },
        error: (err) => {
          alert('Failed to delete appointment ❌');
          console.error(err);
        }
      });
    }
  });


  //Edit-Appointment

  $(document).on('click', '#btn-Edit', (e) => {
    const appointmentId = $(e.currentTarget).val();

    $.ajax({
      method: 'get',
      url: `http://localhost:4050/appointments/${appointmentId}`,
      success: (appointment) => {
        $('#edit-appointment-id').val(appointment.id);
        $('#edit-appointment-title').val(appointment.title);
        $('#edit-appointment-description').val(appointment.description);
        $('#edit-appointment-date').val(appointment.date);
      },
      error: (err) => {
        alert('Failed to load appointment ❌');
        console.error(err);
      }
    });
  });

  //Update & Save Appointment
  $(document).on('click', '#btn-save', (e) => {
    e.preventDefault();

    var appointment = {
      id: $('#edit-appointment-id').val(),
      title: $('#edit-appointment-title').val(),
      description: $('#edit-appointment-description').val(),
      date: $('#edit-appointment-date').val(),
      username: $.cookie('uname')
    };

    $.ajax({
      method: 'put',
      url: `http://localhost:4050/edit-appointment/${$('#edit-appointment-id').val()}`,
      data: appointment,
      success: () => {
        $('#edit-appointment').modal('hide'); // optional: hide modal after saving
        LoadDashboard(); // now only reload after update is complete
      },
      error: (err) => {
        alert('Failed to update appointment ❌');
        console.error(err);
      }
    });
  });

  //Delete User
  $(document).on('click', '#deleteUser', () => {
    alert('Are you sure you want delete your account');
    $.ajax({
      method: 'get',
      url: 'http://localhost:4050/users',
      success: (users) => {
        const foundUser = users.find(user => user.username === $.cookie('uname'));
        if (foundUser) {
          $.ajax({
            method: 'delete',
            url: `http://localhost:4050/users/${foundUser.username}`,
            success: () => {
              $.removeCookie('uname');
            },
            error: () => {
              alert('Failed to Delete Account');
            }

          });
        }
      }
    })
    LoadView('./home.html');
  })


})