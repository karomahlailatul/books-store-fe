"use client";
import { Fragment, useState, useEffect, useRef } from "react";
import privateAxios from "@/libs/privateAxios";
import { AxiosResponse, AxiosError } from "axios";
import { Dialog, Transition } from "@headlessui/react";

interface BookResponse {
  data: Book[];
  message: string;
  status: number;
  pagination: {
    totalData: number;
    totalPage: number;
    page: number;
    limit: number;
  };
}

interface Book {
  id: 1;
  title: string;
  description: string;
  author: string;
  image: string;
  price: string;
  status: boolean;
  sellerId: number;
  createdAt?: string;
  updatedAt?: string;
  categories: BookCategory[];
}

interface BookCategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);

  const [viewBook, setViewBook] = useState<Book | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const bottomBoundaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBooks();
  }, [currentPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          await setCurrentPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (bottomBoundaryRef.current) {
      observer.observe(bottomBoundaryRef.current);
    }

    return () => {
      if (bottomBoundaryRef.current) {
        observer.unobserve(bottomBoundaryRef.current);
      }
    };
  }, [bottomBoundaryRef, hasMore]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response: AxiosResponse<BookResponse> = await privateAxios().get(
        "/books?page=" + currentPage + "&limit=4"
      );
      const data: Book[] = response.data.data;
      setBooks((prevBooks) => [...prevBooks, ...data]);
      setHasMore(currentPage < response.data.pagination.totalPage);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching books:", error as AxiosError);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">Products</h2>

          {books.length === 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                No books found
              </h2>
            </div>
          )}
          {books.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {books?.map((book) => (
                  <button
                    type="button"
                    onClick={() => handleBookClick(book)}
                    key={book.id}
                    // href={`/book/${book.id}`}
                    className="p-6 bg-gray-200 rounded-lg group"
                  >
                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                      />
                    </div>
                    <h3 className="mt-4 text-sm text-gray-700">{book.title}</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      ${book.price}
                    </p>
                    <button
                      type="button"
                      className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg group-hover:bg-gray-600"
                    >
                      View
                    </button>
                  </button>
                ))}
              </div>
            </>
          )}
          {loading && (
            <div className="flex w-full justify-center items-center min-h-96 ">
              <div
                className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500 mr-2"
                role="status"
                aria-label="loading"
              >
                <span className="sr-only">Loading...</span>
              </div>
              Loading...
            </div>
          )}
          <div ref={bottomBoundaryRef}></div>
        </div>

        <Transition appear show={dialogOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => {
              setDialogOpen(false);
              setSelectedBook(null);
            }}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {selectedBook?.title}
                    </Dialog.Title>
                    <div className="mt-2 flex flex-col justify-center gap-2">
                      <img
                        src={selectedBook?.image}
                        alt={selectedBook?.title}
                      />

                      <p className="text-sm text-gray-500">
                        Author : {selectedBook?.author}
                      </p>
                      <p className="text-sm text-gray-500">
                        Description : {selectedBook?.description}
                      </p>

                      <p className="text-sm text-gray-500">
                        Tag :{" "}
                        {selectedBook?.categories &&
                        selectedBook?.categories?.length > 0
                          ? selectedBook?.categories.map(
                              (category) => category.name
                            )
                          : "-"}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => {
                          setDialogOpen(false);
                          setSelectedBook(null);
                        }}
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => {
                          setDialogOpen(false);
                          setSelectedBook(null);
                        }}
                      >
                        <p className="text-lg font-medium text-gray-500">
                          Buy Now! ${selectedBook?.price}
                        </p>
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  );
}
