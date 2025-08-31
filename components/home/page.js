import React from 'react'

function page() {
  return (
     <div className="flex flex-col h-fit w-full sm:w-[90%] md:w-[80%] lg:w-[70%] bg-neutral-800 p-2 rounded-xl shadow-md">
          <div className=" rounded-lg  sm:m-2 p-2 h-130 overflow-y-auto shadow scrollbar-hidden">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center">
                Upload file or data first
              </p>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx + msg.role + msg.content.slice(0, 10)}
                    className={`mb-3 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl shadow-md transition-all duration-300 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white shadow-[0_0_10px_#38bdf8]"
                          : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-gray-100 shadow-[0_0_10px_#555]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="text-left">
                    <div className="inline-block ">
                      <p>typing..</p>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-3">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="chat with your data..."
            />

            <ShimmerButton
              disabled={!pdf && !url && !textData}
              className="shadow-2xl"
              type="submit"
            >
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                <Send />
              </span>
            </ShimmerButton>
          </form>
        </div>
    
  )
}

export default page