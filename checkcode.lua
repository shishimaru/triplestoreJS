#!/usr/bin/env lua
local cmd = 'find -name "*.js" -not -path "./green-turtle/*" -not -path "./microdataJS/*"'

local log_filename = "filenames.log"
os.execute(cmd .. " > " .. log_filename)
local fin = io.open(log_filename)
local stopwords = {"[^\/]+console.log\(.*\)",
                   "[^\/]+alert(.*\)",
                   "\/\/TODO"}

function checkfile(filename)
   local fin = io.open(filename)
   local lineNum = 0
   for line in fin:lines() do
      lineNum = lineNum + 1
      
      for k,v in ipairs(stopwords) do
         if(line:match(v)) then
            print(filename, lineNum, line)
            break
         end
      end
   end
   fin:close()
end

for filename in fin:lines() do
   checkfile(filename)
end

os.remove(log_filename)
fin:close()
