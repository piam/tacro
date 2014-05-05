{
    "name":"&rarr;"
    "depends":[],
    "axioms":[  // 0-hyp theorems only.
        // ax1
        {"Bone":{"Stmt":[0,"T0.0",[0,"T0.1","T0.0"]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        // ax2
        {"Bone":{"Stmt":[0,[0,"T0.0",[0,"T0.1","T0.2"]],[0,[0,"T0.0","T0.1"],[0,"T0.0","T0.2"]]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}}        
    ],
    "secrets":[  // May contain inferences. Not displayed to user.
        // ax-mp
        {"Bone":{"Stmt":T0.0,"Hyps":["T0.1",[0,"T0.1","T0.0"]],"Free":[]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        // To establish bindings on &rarr;
        // imim1
        {"Bone":{"Stmt":[0,[0,"T0.0","T0.1"],[0,[0,"T0.1","T0.2"],[0,"T0.0","T0.2"]]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        // imim2
        {"Bone":{"Stmt":[0,[0,"T0.0","T0.1"],[0,[0,"T0.2","T0.0"],[0,"T0.2","T0.1"]]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
    ],
    "buttons":[ // One-hypothesis inferences only.
    ],
    "goals":[
        {"Bone":{"Stmt":[0,[0,"T0.0","T0.1"],[0,[0,"T0.2","T0.0"],[0,"T0.2","T0.1"]]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,[0,"T0.0","T0.1"],[0,[0,"T0.1","T0.2"],[0,"T0.0","T0.2"]]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,[0,[0,"T0.0","T0.1"],"T0.2"],[0,"T0.1","T0.2"]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,[0,"T0.0",[0,"T0.1","T0.2"]],[0,"T0.1",[0,"T0.0","T0.2"]]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,[0,"T0.0","T0.1"],[0,"T0.0","T0.0"]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,"T0.0",[0,"T0.1","T0.1"]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,"T0.0","T0.0"]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,"T0.0",[0,[0,"T0.0","T0.1"],"T0.1"]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,[0,[0,"T0.0","T0.0"],"T0.1"],"T0.1"]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
        {"Bone":{"Stmt":[0,[0,"T0.0",[0,"T0.0","T0.1"]],[0,"T0.0","T0.1"]]},
         "Meat":{"Terms":["&rarr;"],"Kinds":["wff"]}},
    }]
}}
