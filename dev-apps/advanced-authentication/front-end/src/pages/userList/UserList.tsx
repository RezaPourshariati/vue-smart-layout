import type { AppDispatch, RootState } from '@/redux/store'
import { useEffect, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import { FaTrashAlt } from 'react-icons/fa'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import ChangeRole from '@/components/changeRole/ChangeRole'
import { Spinner } from '@/components/loader/Loader'
import PageMenu from '@/components/pageMenu/PageMenu'
import Search from '@/components/search/Search'
import UserStats from '@/components/userStats/UserStats'
import useRedirectLoggedOutUser from '@/customHook/useRedirectLoggedOutUser'
import { deleteUser, getUsers } from '@/redux/features/auth/authSlice'
import { FILTER_USERS, selectUsers } from '@/redux/features/auth/filterSlice'
import { shortenText } from '../profile/Profile'
import 'react-confirm-alert/src/react-confirm-alert.css'

function UserList() {
  useRedirectLoggedOutUser('/login') // Custom Hook
  const dispatch = useDispatch<AppDispatch>()
  const [search, setSearch] = useState('')
  const { users, isLoading } = useSelector((state: RootState) => state.auth)
  const filteredUsers = useSelector(selectUsers)

  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  const removeUser = async (id: string) => {
    await dispatch(deleteUser(id))
    dispatch(getUsers())
  }

  const confirmDelete = (id: string) => {
    confirmAlert({
      title: 'Delete User',
      message: 'Are you sure to delete this user?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => removeUser(id),
        },
        {
          label: 'Cancel',
          onClick: () => alert('Click Ok'),
        },
      ],
    })
  }

  useEffect(() => {
    dispatch(FILTER_USERS({ users, search }))
  }, [dispatch, users, search])

  // -------------- Begin Pagination
  const itemsPerPage = 5
  const [itemOffset, setItemOffset] = useState(0)

  const endOffset = itemOffset + itemsPerPage

  const currentItems = filteredUsers.slice(itemOffset, endOffset)
  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage)

  // Invoke when user click to request another page.
  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % filteredUsers.length
    setItemOffset(newOffset)
  }
  // -------------- End Pagination

  return (
    <>
      <section>
        <div className="container">
          <PageMenu />
          <UserStats />

          <div className="text-[#333]">
            {isLoading && <Spinner />}
            <div className="p-[5px] w-full overflow-x-auto [&_.search]:w-full [&_.search]:max-w-[300px]">
              <div className="flex justify-between items-center">
                <span>
                  <h3>All Users</h3>
                </span>
                <span><Search value={search} onChange={e => setSearch(e.target.value)} /></span>
              </div>

              {/* Table */}
              {!isLoading && users.length === 0
                ? (<p>No user found...</p>)
                : (
                    <table className="border-collapse w-full text-[1.4rem] [&_thead]:border-t-2 [&_thead]:border-b-2 [&_thead]:border-[#1f93ff] [&_th]:border [&_th]:border-[#eee] [&_th]:align-top [&_th]:text-left [&_th]:p-2 [&_td]:align-top [&_td]:text-left [&_td]:p-2 [&_td.icons]:flex [&_td.icons]:justify-start [&_td.icons]:items-center [&_td.icons>*]:mr-[7px] [&_td.icons>*]:cursor-pointer [&_td.icons>*]:align-middle [&_td.icons>*]:self-center [&_tr]:border-b [&_tr]:border-[#ccc] [&_tr:nth-child(even)]:bg-white [&_tbody_tr:hover]:bg-[rgba(121,136,149,0.3)]">
                      <thead>
                        <tr>
                          <th>S/N</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Change Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {currentItems.map((user, index) => {
                          const { _id, name, email, role } = user
                          return (
                            <tr key={_id}>
                              <td>{index + 1}</td>
                              <td>{shortenText(name, 14)}</td>
                              <td>{email}</td>
                              <td>{role}</td>
                              <td><ChangeRole id={_id} email={email} /></td>
                              <td>
                                <span className="icon">
                                  <FaTrashAlt
                                    size={20}
                                    color="#c81d25"
                                    onClick={() => confirmDelete(_id)}
                                  />
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
              <hr color="greenyellow" />
            </div>
            <ReactPaginate
              breakLabel="..."
              nextLabel="Next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={pageCount}
              previousLabel="Prev"
              renderOnZeroPageCount={null}
              containerClassName="pagination"
              pageLinkClassName="page-num"
              previousLinkClassName="page-num"
              nextLinkClassName="page-num"
              activeLinkClassName="activePage"
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default UserList
