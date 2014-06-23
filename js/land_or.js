{
    name:"&or;",
    depends:["&harr;"],  // TODO: figure out a content-addressable scheme
    goals:[
        {Core:[[],[0,[1,[2,0],1],[3,0,1]],[]],
         Skin:{TermNames:["&harr;","&rarr;","&not;","&or;"]},
         Tree:{Cmd:"defthm",Definiendum: 3}},

        {Core:[[],[0,0,[1,1,0]],[]],
         Skin:{TermNames:["&rarr;","&or;"]}},
        {Core:[[],[0,0,[1,0,1]],[]],
         Skin:{TermNames:["&rarr;","&or;"]}},
        {Core:[[],[0,[0,0,1],[0,[1,0,2],[1,1,2]]],[]],
         Skin:{TermNames:["&rarr;","&or;"]}},
        {Core:[[],[0,[1,0,1],[1,[2,0,2],[2,1,2]]],[]],
         Skin:{TermNames:["&rarr;","&harr;","&or;"]}},
        {Core:[[],[0,[0,0,1],[0,[1,2,0],[1,2,1]]],[]],
         Skin:{TermNames:["&rarr;","&or;"]}},
        {Core:[[],[0,[1,0,1],[1,[2,2,0],[2,2,1]]],[]],
         Skin:{TermNames:["&rarr;","&harr;","&or;"]}},
        {Core:[[],[0,[1,0,1],[1,1,0]],[]],
         Skin:{TermNames:["&harr;","&or;"]}},

    ],
}
